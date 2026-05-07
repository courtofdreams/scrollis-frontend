import React, { useState, useRef } from 'react';

import {
	Pressable,
	Animated,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ApiErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
	const heightAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const [visible, setVisible] = useState(false);
 
	React.useEffect(() => {
		if (message) {
			setVisible(true);
			Animated.parallel([
				Animated.spring(heightAnim, {
					toValue: 1,
					useNativeDriver: false,
					damping: 18,
					stiffness: 180,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 180,
					useNativeDriver: false,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(heightAnim, {
					toValue: 0,
					duration: 220,
					useNativeDriver: false,
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: 180,
					useNativeDriver: false,
				}),
			]).start(() => setVisible(false));
		}
	}, [message]);
 
	if (!visible && !message) return null;
 
	const maxHeight = heightAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 120],
	});
 
	return (
		<Animated.View style={[bannerStyles.container, { maxHeight, opacity: opacityAnim }]}>
			<View style={bannerStyles.inner}>
				<View style={bannerStyles.iconWrap}>
					<Feather name="alert-circle" size={18} color="#FFFFFF" />
				</View>
				<Text style={bannerStyles.message} numberOfLines={3}>{message}</Text>
				<Pressable onPress={onDismiss} hitSlop={8} style={bannerStyles.close}>
					<Feather name="x" size={16} color="rgba(255,255,255,0.85)" />
				</Pressable>
			</View>
		</Animated.View>
	);
}
 
const bannerStyles = StyleSheet.create({
	container: {
		overflow: 'hidden',
		backgroundColor: '#C0392B',
	},
	inner: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 10,
	},
	iconWrap: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: 'rgba(255,255,255,0.18)',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	message: {
		flex: 1,
		fontSize: 13,
		lineHeight: 19,
		color: '#FFFFFF',
		fontWeight: '500',
	},
	close: {
		flexShrink: 0,
		padding: 2,
	},
});
