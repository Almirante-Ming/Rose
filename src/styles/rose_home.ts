import { StyleSheet } from "react-native";

export const rose_home = StyleSheet.create({
container: { 
    flex: 1,
    padding: 20, 
    backgroundColor: '#640D14' 
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
    color: '#ff5733', 
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
});