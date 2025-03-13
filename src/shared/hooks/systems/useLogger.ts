// src/shared/hooks/useLogger.ts

import { logger } from '@shared/lib/logger/logger.service';
import { useEffect, useRef } from 'react';

interface UseLoggerOptions {
    logProps?: boolean;
    logLifecycle?: boolean;
    logRenders?: boolean;
}

export function useLogger(componentName: string, props?: any, options: UseLoggerOptions = {}) {
    const { logProps = true, logLifecycle = true, logRenders = false } = options;

    const renderCount = useRef(0);
    const prevPropsRef = useRef(props);

    // Отслеживаем монтирование/размонтирование
    useEffect(() => {
        if (logLifecycle) {
            logger.component(componentName, 'mount', props);
        }
        return () => {
            if (logLifecycle) {
                logger.component(componentName, 'unmount');
            }
        };
    }, []);

    // Отслеживаем изменения props
    useEffect(() => {
        if (logProps && prevPropsRef.current !== props) {
            logger.component(componentName, 'propsUpdate', {
                prev: prevPropsRef.current,
                next: props,
            });
            prevPropsRef.current = props;
        }
    }, [props]);

    // Отслеживаем ререндеры
    useEffect(() => {
        if (logRenders) {
            renderCount.current += 1;
            logger.debug(`Render #${renderCount.current}`, componentName);
        }
    });

    // Возвращаем методы логгера с привязанным контекстом компонента
    return {
        log: (message: any, title?: string) => logger.log(message, componentName, title),
        debug: (message: any, title?: string) => logger.debug(message, componentName, title),
        warn: (message: any, title?: string) => logger.warn(message, componentName, title),
        error: (message: any, error?: Error, title?: string) =>
            logger.error(message, componentName, error?.message, title),
        table: (data: any[], options = {}) => logger.table(data, { ...options, context: componentName }),
        json: (data: any, options = {}) => logger.json(data, { ...options, context: componentName }),
        group: (label: string, callback: () => void) => logger.group(label, callback),
        api: (method: string, url: string, data?: any, response?: any) => logger.api(method, url, data, response),
    };
}
