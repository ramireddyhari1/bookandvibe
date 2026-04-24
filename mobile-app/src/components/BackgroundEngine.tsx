import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const BackgroundEngine = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#050510", "#0A0A1F", "#000000"]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
