import { StyleSheet } from "react-native";
import { rose_theme } from "@/constants/rose_theme";

export const rose_home = StyleSheet.create({
container: { 
    flex: 1,
    padding: 20, 
    backgroundColor: rose_theme.dark_bg
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 20,
},
userInfo: {
    flex: 1,
},
welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: rose_theme.text_light,
    marginBottom: 2,
},
roleText: {
    fontSize: 14,
    color: rose_theme.text_secondary,
},
logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
},
logoutText: {
    color: rose_theme.rose_main,
    fontSize: 14,
    fontWeight: '600',
},
calendarContainer: {
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 15,
    padding: 10,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
},
modalBackground: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, backgroundColor: 'black' 
},
modalWrapper: { 
    flex: 1, 
    justifyContent: 'flex-end' 
},
modalContainer: { 
    height: '50%', 
    width: '100%', 
    backgroundColor: rose_theme.dark_surface, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: rose_theme.rose_main
},
title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: rose_theme.text_light, 
    textAlign: 'center' 
},
card: { 
    flexDirection: 'row', 
    backgroundColor: rose_theme.white, 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    alignItems: 'center', 
    justifyContent: 'space-between' 
},
cardLeft: { 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    flex: 1 
},
cardRight: { 
    flexDirection: 'column', 
    alignItems: 'flex-end', 
    flex: 1 
},
cardTime: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: rose_theme.light_text_primary 
},
cardSubject: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: rose_theme.text_dark, 
    marginTop: 5,
    borderBottomWidth: 2,
    borderBottomColor: rose_theme.rose_main,
    paddingBottom: 5
},
cardLocation: { 
    fontSize: 14, 
    color: rose_theme.light_text_secondary, 
    fontStyle: 'italic' 
},
cardNote: { 
    fontSize: 14, 
    color: rose_theme.light_text_secondary, 
    marginTop: 5 
},
emptyText: { 
    fontSize: 14, 
    color: rose_theme.text_secondary, 
    textAlign: 'center', 
    marginTop: 20 
},
loadingText: { 
    fontSize: 14, 
    color: rose_theme.text_light, 
    textAlign: 'center', 
    marginTop: 20 
},
notesSection: {
    flex: 1,
    marginTop: 20,
    backgroundColor: rose_theme.dark_surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: rose_theme.rose_main,
},
notesListContainer: {
    position: 'relative',
},
notesList: {
    maxHeight: 220, // Height for 2 full cards (~85px each) + margins (10px each) + partial view of 3rd card
},
downArrowContainer: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
},
notesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: rose_theme.text_light,
    textAlign: 'center',
    marginBottom: 15,
},
noteCard: {
    flexDirection: 'row',
    backgroundColor: rose_theme.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: rose_theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
},
noteCardLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
},
noteCardRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
},
noteCardTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: rose_theme.light_text_primary,
},
noteCardSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: rose_theme.text_dark,
    marginTop: 5,
    borderBottomWidth: 2,
    borderBottomColor: rose_theme.rose_main,
    paddingBottom: 3,
},
noteCardTrainer: {
    fontSize: 13,
    color: rose_theme.light_text_secondary,
    marginTop: 3,
    fontStyle: 'italic',
},
noteCardDate: {
    fontSize: 12,
    color: rose_theme.light_text_secondary,
    marginTop: 3,
    fontStyle: 'italic',
},
noteCardLocation: {
    fontSize: 14,
    color: rose_theme.light_text_secondary,
    fontStyle: 'italic',
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: rose_theme.text_light,
    borderBottomWidth: 2,
    borderBottomColor: rose_theme.rose_main,
    paddingBottom: 10,
    textAlign: 'center',
},
modalContent: {
    backgroundColor: rose_theme.white,
    borderRadius: 10,
    padding: 20,
},
modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: rose_theme.light_border,
    paddingBottom: 10,
},
modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: rose_theme.light_text_primary,
    flex: 1,
},
modalValue: {
    fontSize: 16,
    color: rose_theme.light_text_secondary,
    flex: 2,
    textAlign: 'right',
},
});