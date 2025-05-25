import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const TextStyles = StyleSheet.create({
  // Headings
  H1: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
    fontFamily: 'Poppins-Bold',
    textAlign: 'left',
    marginBottom: 8,
  },
  H1_Dark: {
    color: '#FFFFFF',
  },
  
  // Body text
  Body: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    lineHeight: 24,
    paddingHorizontal: 0,
  },
  Body_Dark: {
    color: '#FFFFFF',
  },
  
  // Button text
  Button: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  Button_Dark: {
    color: '#FFFFFF',
  },
  
  // Skip button text
  Skip: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.Text.Primary,
    fontFamily: 'Poppins-Medium',
  },
  Skip_Dark: {
    color: Colors.Text.Dark.Primary,
  },
  
  // Caption text
  Caption: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    lineHeight: 20,
  },
  Caption_Dark: {
    color: '#AAAAAA',
  },
}); 