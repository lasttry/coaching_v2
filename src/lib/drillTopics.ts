import type { TFunction } from 'i18next';
import type { DrillTopicInterface } from '@/types/drills/types';

/** Resolve the display label for a drill topic. Seeded defaults carry a
 * `key` that maps to a localised string in `drill.topicNames.*`; admin-
 * created topics fall back to their raw `name`. */
export function topicLabel(t: TFunction, topic: Pick<DrillTopicInterface, 'key' | 'name'>): string {
  if (topic.key) {
    return t(`drill.topicNames.${topic.key}`, { defaultValue: topic.name });
  }
  return topic.name;
}
