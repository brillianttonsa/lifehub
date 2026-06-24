import {Wallet, Flame, CalendarCheck, FolderKanban} from 'lucide-react'

export 
const modules = [
  {
    icon: Wallet,
    name: "Pocket",
    desc: "Track income, expenses & budgets",
    color: "from-violet-500/20 to-indigo-500/10",
    accent: "text-violet-400",
    border: "border-violet-500/20 hover:border-violet-500/40",
  },
  {
    icon: FolderKanban,
    name: "Project",
    desc: "Log progress & collaboration",
    color: "from-blue-500/20 to-cyan-500/10",
    accent: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: Flame,
    name: "Habit",
    desc: "Build streaks & track growth",
    color: "from-orange-500/20 to-amber-500/10",
    accent: "text-orange-400",
    border: "border-orange-500/20 hover:border-orange-500/40",
  },
  {
    icon: CalendarCheck,
    name: "Plan",
    desc: "Set goals & roadmaps",
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
  },
];
