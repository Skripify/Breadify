import chalk from "chalk";

export default {
  info(...text: any[]) {
    console.log(chalk.cyanBright("[INFO]"), ...text);
  },
  success(...text: any[]) {
    console.log(chalk.greenBright("[SUCCESS]"), ...text);
  },
  error(...text: any[]) {
    console.log(chalk.redBright("[ERROR]"), ...text);
  },
  warning(...text: any[]) {
    console.log(chalk.yellowBright("[WARNING]"), ...text);
  },
};
