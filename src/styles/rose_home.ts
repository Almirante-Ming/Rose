import { StyleSheet } from "react-native";
import { rose_theme } from "@/constants/rose_theme";

export const rose_home = StyleSheet.create({
container: { 
    flex: 1,
    padding: 20, 
    backgroundColor: rose_theme.rose_dark
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
    color: '#FFFFFF',
    marginBottom: 2,
},
roleText: {
    fontSize: 14,
    color: '#CCCCCC',
},
logoutButton: {
    backgroundColor: rose_theme.rose_light,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
},
logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
},
calendarContainer: {
    backgroundColor: rose_theme.rose_light,
    borderRadius: 15,
    padding: 10,
    marginBottom: 0,
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
    backgroundColor: '#ae2831', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20 
},
title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#FFFFFF', 
    textAlign: 'center' 
},
card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
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
    color: '#333' 
},
cardSubject: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ae2831', 
    marginTop: 5 
},
cardLocation: { 
    fontSize: 14, 
    color: '#555', 
    fontStyle: 'italic' 
},
cardNote: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 5 
},
emptyText: { 
    fontSize: 14, 
    color: '#DDD', 
    textAlign: 'center', 
    marginTop: 20 
},
loadingText: { 
    fontSize: 14, 
    color: '#FFF', 
    textAlign: 'center', 
    marginTop: 20 
},
notesSection: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#ae2831',
    borderRadius: 15,
    padding: 15,
},
notesListContainer: {
    position: 'relative',
},
notesList: {
    maxHeight: 195, // Height for exactly 2 cards (card height ~75px + margin 10px each = ~170px + some padding)
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
},
noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
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
    color: '#333',
},
noteCardSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#810e13',
    marginTop: 5,
},
noteCardDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    fontStyle: 'italic',
},
noteCardLocation: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
},
modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
},
modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
},
modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
},
modalValue: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right',
},
});