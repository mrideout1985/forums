type ClassValue = string | undefined | null | boolean;

const classNames = (...classes: ClassValue[]): string => {
  return classes.filter(Boolean).join(" ");
};

export default classNames;
