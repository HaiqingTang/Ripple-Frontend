import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const LogButton: React.FC<Props> = ({ label, onPress, containerStyle, buttonStyle, textStyle }) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress} activeOpacity={0.8}>
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LogButton;


