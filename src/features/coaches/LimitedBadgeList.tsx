'use client'

import { Badge } from '@shared/ui/badge'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface LimitedBadgeListProps {
    items: string[]
    limit?: number
    title: string
}

const LimitedBadgeList: React.FC<LimitedBadgeListProps> = ({ items, limit = 2, title }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const { t } = useTranslation()

    const displayedItems = isExpanded ? items : items.slice(0, limit)
    const hiddenCount = items.length - limit

    return (
        <div className="mb-4">
            <h4 className="mb-2 text-xs">{title}:</h4>
            <div className="flex flex-wrap gap-2">
                {displayedItems.map((item, index) => (
                    <Badge key={index} variant="outline">{t(item)}</Badge>
                ))}
                {!isExpanded && hiddenCount > 0 && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="hover:underline underline-offset-2 text-xs"
                    >
                        {t('more', { count: hiddenCount })}
                    </button>
                )}
            </div>
        </div>
    )
}

export default LimitedBadgeList