// src/features/projects/components/ProjectChoice.tsx
import { useProjects } from '@shared/hooks/plans/useProjects'
import { Button } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'
interface ProjectChoiceProps {
    selectedProjectId: number | null
    onChangeSelectedProject: (id: number | null) => void
}

export function ProjectChoice({ selectedProjectId, onChangeSelectedProject }: ProjectChoiceProps) {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(false)
    const { projects } = useProjects()

    const createProject = () =>
        router.push('/(modals)/(plans)/new-project')

    useEffect(() => {
        console.log('selectedProjectId', selectedProjectId)
    }, [selectedProjectId])

    const selectedProject = projects?.find(p => p.id === selectedProjectId)

    const menuAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: withSpring(isVisible ? 0 : 50, {
                mass: 0.5,
                damping: 12,
                stiffness: 100,
            }),
        }],
    }))

    const handleSelect = (projectId: number | null) => {
        onChangeSelectedProject(projectId)
        setIsVisible(false)
    }

    const handleToggleMenu = () => {
        console.log('Menu clicked, current state:', isVisible)
        setIsVisible(!isVisible)
    }

    useEffect(() => {
        console.log('Menu visibility changed to:', isVisible)
    }, [isVisible])

    return (
        <View className='flex-1'>
            <Pressable
                onPress={handleToggleMenu}
                className="p-2 relative"
            >
                <Button
                    size='sm'
                    variant='outline'
                    className="w-32"
                    onPress={handleToggleMenu}
                    leftIcon={selectedProject?.color ? 'Circle' : undefined}
                    iconSize={10}
                    iconProps={{
                        color: selectedProject?.color,
                        fill: selectedProject?.color
                    }}
                >
                    {selectedProject ? selectedProject.name : t('plans.projects.allProjects')}
                </Button>
            </Pressable>

            {isVisible && (
                <Animated.View
                    className="absolute left-0 bottom-16 gap-y-4 z-50"
                    style={[
                        menuAnimatedStyle,
                        {
                            zIndex: 45,
                            minWidth: '100%'
                        }
                    ]}
                >

                    <Animated.View entering={FadeInDown.delay(50 + (projects?.length || 0 + 1) * 50).springify()} >
                        <Button
                            onPress={() => {
                                setIsVisible(false)
                                createProject()
                            }}
                            size='sm'
                            leftIcon='Plus'
                            iconSize={16}
                        >
                            {t('common.create')}
                        </Button>
                    </Animated.View>

                    {projects && projects.length > 0 &&
                        <View className='flex-1 gap-y-2'>
                            {projects?.map((project, index) => (
                                <Animated.View
                                    key={project.id}
                                    entering={FadeInDown.delay(50 + (index + 1) * 50).springify()}
                                    className="w-full"
                                >
                                    <Button
                                        onPress={() => handleSelect(project.id)}
                                        size='sm'
                                        leftIcon='Circle'
                                        iconSize={10}
                                        iconProps={{
                                            color: project.color,
                                            fill: project.color
                                        }}
                                        className="w-full"
                                    >
                                        {project.name}
                                    </Button>
                                </Animated.View>
                            ))}
                        </View>
                    }


                    <Animated.View entering={FadeInDown.delay(50).springify()}>
                        <Button
                            onPress={() => handleSelect(null)}
                            size='sm'
                        >
                            {t('plans.projects.allProjects')}
                        </Button>
                    </Animated.View>



                </Animated.View>
            )}
        </View>

    )
}