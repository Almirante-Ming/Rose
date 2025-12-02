import { StyleSheet } from "react-native";
import { rose_theme } from '@constants/rose_theme';

export const nfd_styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: rose_theme.white,
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
  },
});