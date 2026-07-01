export const viewVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };
