import {
  Heart,
  HeartHandshake,
  CalendarHeart,
  Flower2,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react';
const icons = {
  user: UserRound,
  hearts: UsersRound,
  stars: Sparkles,
  flower: Flower2,
  heart: Heart,
  hands: HeartHandshake,
  calendar: CalendarHeart,
  mic: Mic,
  shield: ShieldCheck,
};
export function AgentIcon({ name, size = 23 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Heart;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}
