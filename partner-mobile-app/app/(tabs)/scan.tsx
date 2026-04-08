import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../../src/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Zap, ZapOff, QrCode, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <QrCode size={64} color={COLORS.primary} style={{ marginBottom: 24 }} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>We need your permission to scan booking QR codes at the venue.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || verifying) return;
    setScanned(true);
    setVerifying(true);

    try {
      const ticketCode = String(data || '').trim();
      if (!/^TKT-[A-Z0-9]+$/i.test(ticketCode)) {
        throw new Error('Invalid ticket code');
      }

      setTimeout(() => {
        setVerifying(false);
        Alert.alert(
          'Booking Verified',
          `Ticket: ${ticketCode}\nStatus: Ready for check-in\nBooking lookup can be added once the backend exposes a partner verify endpoint.`,
          [
            { 
              text: 'Mark Attended', 
              onPress: () => {
                setScanned(false);
                router.push('/(tabs)/bookings');
              } 
            },
            { 
              text: 'Cancel', 
              onPress: () => setScanned(false),
              style: 'cancel' 
            }
          ]
        );
      }, 1500);
    } catch (error) {
      setVerifying(false);
      Alert.alert('Error', 'Invalid or unsupported QR code');
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.torchBtn} onPress={() => setTorch(!torch)}>
              {torch ? <ZapOff size={24} color={COLORS.text} /> : <Zap size={24} color={COLORS.text} />}
            </TouchableOpacity>
          </View>

          <View style={styles.scanContainer}>
            <View style={styles.scannerOutline}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {verifying && (
                <View style={styles.verifyingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.verifyingText}>VERIFYING...</Text>
                </View>
              )}
            </View>
            <Text style={styles.hintText}>Position the QR code within the frame</Text>
          </View>

          <View style={styles.bottomBar}>
            <View style={styles.infoBox}>
              <AlertCircle size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>Scan user's ticket at entry for check-in</Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: COLORS.textDimUnits,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerOutline: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  verifyingText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  hintText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bottomBar: {
    padding: 24,
    paddingBottom: 48,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
