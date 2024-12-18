/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-07-11 14:21:11
 * @FilePath     : /src/time.ts
 * @LastEditTime : 2024-12-18 20:34:31
 * @Description  : 
 */

export class SiYuanDate extends Date {

    beginOfDay() {
        const date = new SiYuanDate(this.getTime());
        date.setHours(0, 0, 0, 0);
        return date;
    }

    toString(hms: boolean = true) {
        return formatDateTime('yyyyMMdd' + (hms ? 'HHmmss' : ''), this) as string;
    }

    [Symbol.toPrimitive](hint: string) {
        switch (hint) {
            case 'string': return this.toString();
            default: return super[Symbol.toPrimitive](hint);
        }
    }

    /**
     * 默认为 yyyy-MM-dd HH:mm:ss
     * @param fmt 
     * @returns 
     */
    format(fmt: string) {
        return formatDateTime(fmt, this);
    }


    add(days: number | string) {
        const parseDelta = (): { unit: 'd' | 'w' | 'm' | 'y', delta: number } => {
            if (typeof days === 'string') {
                const match = days.match(/^(-?\d+)(d|w|m|y)$/);
                if (match) {
                    return { unit: match[2] as 'd' | 'w' | 'm' | 'y', delta: parseInt(match[1]) };
                }
            }
            return { unit: 'd', delta: days as number ?? 0 };
        }
        const { unit, delta } = parseDelta();
        const newDate = new SiYuanDate(this.getTime());
        switch (unit) {
            case 'd': newDate.setDate(newDate.getDate() + delta); break;
            case 'w': newDate.setDate(newDate.getDate() + delta * 7); break;
            case 'm': newDate.setMonth(newDate.getMonth() + delta); break;
            case 'y': newDate.setFullYear(newDate.getFullYear() + delta); break;
        }
        return newDate;
    }
}

/**
 * 将思源时间戳转换为 Date 对象
 * @param timestr 
 * @returns 
 */
export const parseSiYuanTimestamp = (timestr: string) => {
    return new SiYuanDate(timestr.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6'));
}

export const formatSiYuanTimestamp = (date: Date) => {
    return formatDateTime('yyyyMMddHHmmss', date);
}

export const formatSiYuanDate = (date: Date) => {
    return formatDateTime('yyyyMMdd', date);
}

const renderString = (template: string, data: { [key: string]: string }) => {
    for (let key in data) {
        template = template.replace(key, data[key]);
    }
    return template;
}

/**
 * yyyy-MM-dd HH:mm:ss
 * @param template 
 * @param now 
 * @returns 
 */
export const formatDateTime = (template: string, now?: Date) => {
    now = now || new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    return renderString(template, {
        'yyyy': year.toString(),
        'MM': month.toString().padStart(2, '0'),
        'dd': day.toString().padStart(2, '0'),
        'HH': hour.toString().padStart(2, '0'),
        'mm': minute.toString().padStart(2, '0'),
        'ss': second.toString().padStart(2, '0'),
        'yy': year.toString().slice(-2),
    });
}
