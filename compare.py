def load_file_to_dict(filepath):
    data = {}
    with open(filepath, 'r') as file:
        for line in file:
            parts = line.strip().split(maxsplit=1)
            if len(parts) == 1:
                # No value given, set to None or empty string
                data[parts[0]] = None
            elif len(parts) == 2:
                # Variable and value provided
                data[parts[0]] = parts[1]
    return data

def compare_files(file1, file2):
    data1 = load_file_to_dict(file1)
    data2 = load_file_to_dict(file2)

    differences = {
        "in_file1_not_in_file2": {},
        "in_file2_not_in_file1": {},
        "different_values": {}
    }

    # Compare values in both files
    for key in data1:
        if key not in data2:
            differences["in_file1_not_in_file2"][key] = data1[key]
        elif data1[key] != data2[key]:
            differences["different_values"][key] = (data1[key], data2[key])

    for key in data2:
        if key not in data1:
            differences["in_file2_not_in_file1"][key] = data2[key]

    return differences

# Paths to the two files
file1 = 'file1.txt'
file2 = 'file2.txt'

# Run the comparison
differences = compare_files(file1, file2)

# Display results
print("Variables in file1 not in file2:", differences["in_file1_not_in_file2"])
print("Variables in file2 not in file1:", differences["in_file2_not_in_file1"])
print("\nVariables with different values:")
for key, (value1, value2) in differences["different_values"].items():
    print(f"  {key}: file1 = {value1}, file2 = {value2}")
