import { StorageValueModal } from '@widgets/profile/screens/inner/StorageValueModal'
import { useLocalSearchParams } from 'expo-router'

export default function StorageItem() {
    const { item } = useLocalSearchParams()
    const itemData = JSON.parse(item as string)

    return (
        <StorageValueModal
            storageKey={itemData.key}
            value={itemData.value}
            size={itemData.size}
        />
    )
}