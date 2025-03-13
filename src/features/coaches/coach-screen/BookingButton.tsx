import { PackageType } from '@shared/types/coaches/PackageType'
import { Button } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BookingButtonProps {
    onPress: () => void
    price: number
    disabled?: boolean
    loading?: boolean
    packages: PackageType[]
    isPackagesPending: boolean
}

export const BookingButton = ({
    onPress,
    price,
    disabled,
    loading,
    packages,
    isPackagesPending,
}: BookingButtonProps) => {

    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    const noPackages = packages.length === 0

    return (
        <View className="flex flex-row justify-between p-4" style={{ paddingBottom: insets.bottom }}>
            {/* <Button
                disabled={disabled}
                loading={loading}
                leftIcon='Mail'
                variant="outline"
                aria-label={t('coaches.coach.booking.contact')}
            /> */}
            {/* <Button
                onPress={onPress}
                disabled={disabled || isPackagesPending || noPackages}
                loading={loading || isPackagesPending}
                variant={noPackages ? "outline" : "default"}
                aria-label={noPackages ? t("coaches.coach.booking.noPackages") : t("coaches.coach.booking.button")}
                className="flex-1 ml-4"
            >
                {noPackages
                    ? t("coaches.coach.booking.noPackages")
                    : t("coaches.coach.booking.button")
                }
            </Button> */}
            <Button
                onPress={onPress}
                variant="outline"
                aria-label={t("coaches.coach.booking.openOnSite")}
                className="flex-1"
            >
                {t("coaches.coach.booking.openOnSite")}
            </Button>
        </View>
    )
}