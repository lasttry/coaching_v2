import csv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from datetime import datetime
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import os

# Set the maximum number of threads
MAX_THREADS = 20  # Adjust as needed
CSV_FILE = "teams_atletas.csv"

# Function to initialize a WebDriver instance
def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Load existing data from CSV to avoid duplicate scraping
def load_existing_data():
    existing_data = set()
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Use a unique identifier like team and athlete name
                existing_data.add((row["team_link"], row["athlete_name"]))
    return existing_data

# Save a single athlete's data to CSV
def save_athlete_data(team_link, athlete_data):
    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        fieldnames = ["team_link", "athlete_name", "athlete_url", "birthday", "age"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        # Write header if file is empty
        if file.tell() == 0:
            writer.writeheader()
        
        # Write the athlete's data
        writer.writerow({
            "team_link": team_link,
            "athlete_name": athlete_data["name"],
            "athlete_url": athlete_data["url"],
            "birthday": athlete_data["birthday"],
            "age": athlete_data["age"]
        })

# Function to fetch athlete data
def fetch_athlete_data(atleta_url, team_link, existing_data):
    driver = create_driver()
    driver.get(atleta_url)
    time.sleep(2)
    atleta_soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    # Find the athlete's name, birthday, and calculate age
    name_div = atleta_soup.find("h2", class_="name")
    name = name_div.text.strip() if name_div else "Name not found"

    # Check if we already have this athlete's data
    if (team_link, name) in existing_data:
        print(f"Skipping already existing data for {name}")
        return None  # Skip if data is already in CSV

    birthday_text = None
    age = None

    # Find the birthday in the "biografia-resume" section
    biografia_resume = atleta_soup.find("div", class_="biografia-resume")
    if biografia_resume:
        for item in biografia_resume.find_all("div"):
            if item.find("p") and item.find("p").text.strip() == "Data de Nascimento":
                birthday_span = item.find("span")
                if birthday_span:
                    birthday_text = birthday_span.text.strip()
                    birthday = datetime.strptime(birthday_text, "%d/%m/%Y")
                    # Calculate age
                    today = datetime.today()
                    age = today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))
                break

    athlete_data = {
        "name": name,
        "url": atleta_url,
        "birthday": birthday_text if birthday else "Birthday not found",
        "age": age if age else "Age not found"
    }

    # Save immediately after fetching
    save_athlete_data(team_link, athlete_data)
    existing_data.add((team_link, name))  # Update existing data to prevent re-scraping in the same session

    return athlete_data

# Function to fetch team data with progress tracking for athletes
def fetch_team_data(team_link, existing_data):
    driver = create_driver()
    driver.get(team_link)
    time.sleep(2)
    team_soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    # Find all athletes in the team
    atletas = team_soup.find_all("div", class_="roster__player")
    atletas_data = []

    # Use multithreading to fetch each athlete's data with a progress bar
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = []
        with tqdm(total=len(atletas), desc=f"Fetching athletes for team {team_link}", leave=False) as pbar:
            for atleta in atletas:
                link_tag = atleta.find("a")
                atleta_url = f"https://www.fpb.pt{link_tag['href']}" if link_tag else None
                if atleta_url:
                    futures.append(executor.submit(fetch_athlete_data, atleta_url, team_link, existing_data))

            for future in as_completed(futures):
                result = future.result()
                if result:
                    atletas_data.append(result)
                pbar.update(1)

    return {"team_link": team_link, "atletas": atletas_data}

# Main function to handle team data collection
def main():
    # Load existing data to skip previously saved entries
    existing_data = load_existing_data()

    url = "https://www.fpb.pt/equipas/10391/"
    driver = create_driver()
    driver.get(url)
    time.sleep(5)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    team_links = [f"https://www.fpb.pt{link['href']}" for link in soup.find_all("a", href=True) if "/equipa/" in link["href"]]

    # Use multithreading for each team with a progress bar
    with ThreadPoolExecutor(max_workers=1) as executor, tqdm(total=len(team_links), desc="Fetching teams") as team_pbar:
        team_futures = [executor.submit(fetch_team_data, team_link, existing_data) for team_link in team_links]
        for future in as_completed(team_futures):
            team_pbar.update(1)

# Run the main function
if __name__ == "__main__":
    main()
