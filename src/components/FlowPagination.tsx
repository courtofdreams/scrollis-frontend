import React from 'react';
import { StyleSheet, View } from 'react-native';
import { themeColors } from '../utils/Theme';

type FlowPaginationProps = {
	currentIndex: number;
	total: number;
};

export default function FlowPagination({ currentIndex, total }: FlowPaginationProps) {
	return (
		<View style={styles.paginationContainer}>
			{Array.from({ length: total }).map((_, index) => {
				const isActive = index === currentIndex;
				return (
					<View
						key={index}
						style={[styles.paginationDot, isActive && styles.paginationDotActive]}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	paginationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	paginationDot: {
		width: 10,
		height: 10,
		borderRadius: 999,
		backgroundColor: 'rgba(83, 74, 183, 0.18)',
	},
	paginationDotActive: {
		width: 58,
		height: 12,
		borderRadius: 999,
		backgroundColor: themeColors.primary,
	},
});