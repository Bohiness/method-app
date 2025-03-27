import { ModalFullScreenContent } from '@entities/modals/modal-full-screen-content'
import { StorageValueModal } from '@widgets/profile/screens/inner/StorageValueModal'
import { router, useLocalSearchParams } from 'expo-router'

export default function StorageItem() {
    const { item } = useLocalSearchParams()
    const itemData = JSON.parse(item as string)

    return (
        <ModalFullScreenContent
            headerOnClose={() => {
                router.back()
            }}
        >
            <StorageValueModal
                storageKey={itemData.key}
                value={itemData.value}
                size={itemData.size}
            />
        </ModalFullScreenContent>
    )
}