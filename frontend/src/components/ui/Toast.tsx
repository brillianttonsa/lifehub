import {AlertCircle, CheckCircle2} from "lucide-react";
import { motion } from "framer-motion";


export function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-4 ${
        type === "success"
          ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
          : "bg-red-500/15 border border-red-500/25 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={15} />
      ) : (
        <AlertCircle size={15} />
      )}
      {message}
    </motion.div>
  );
}