import { useTheme } from '@shared/context/theme-provider'
import { Image } from "expo-image"

export const Logo = ({ size = { height: 70, width: 300 } }: { size?: { height?: number, width?: number } }) => {
    const { isDark } = useTheme()
    const logoSource = isDark
        ? require('@assets/images/logo/logo-white.svg')
        : require('@assets/images/logo/logo-black.svg')

    return (
        <Image
            source={logoSource}
            contentFit="contain"
            style={{ height: size?.height, width: size?.width }}
        />
    )
}