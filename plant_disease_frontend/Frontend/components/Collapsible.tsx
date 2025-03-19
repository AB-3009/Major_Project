import { PropsWithChildren, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

export function Collapsible({
    children,
    title,
}: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const theme = 'light'

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity
                style={styles.heading}
                onPress={() => setIsOpen((value) => !value)}
                activeOpacity={0.8}
            >
                <IconSymbol
                    name='chevron.right'
                    size={18}
                    weight='medium'
                    color={
                        theme === 'light' ? Colors.light.icon : Colors.dark.icon
                    }
                    style={{
                        transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                    }}
                />
                <ThemedText type='defaultSemiBold' style={styles.title}>
                    {title}
                </ThemedText>
            </TouchableOpacity>
            {isOpen && (
                <ThemedView style={styles.content}>{children}</ThemedView>
            )}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        color: '#333',
    },
    content: {
        marginTop: 6,
        marginLeft: 24,
    },
})
