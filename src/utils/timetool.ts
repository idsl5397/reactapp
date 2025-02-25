/**
 * 民國格式日期工具
 * 提供多種格式轉換函式，支援 ISO 日期與民國年制。
 */
export const ROCformatDateTools = {
    /**
     * 將 ISO 日期字串轉換為 YYYY/MM/DD 格式
     *
     * @param {string} isoString ISO 8601 格式的日期字串
     * @returns {string} YYYY/MM/DD 格式的日期
     */
    formatDate: (isoString: string): string => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false
        }).format(date);
    },

    /**
     * 將 ISO 日期字串轉換為 YYYY/MM/DD HH:mm 格式
     *
     * @param {string} isoString ISO 8601 格式的日期字串
     * @returns {string} YYYY/MM/DD HH:mm 格式的日期時間
     */
    formatDateTime: (isoString: string): string => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    },

    /**
     * 將 ISO 日期字串轉換為民國年制格式 YYY/MM/DD HH:mm
     *
     * @param {string} isoString ISO 8601 格式的日期字串
     * @returns {string} YYY/MM/DD HH:mm 格式的民國日期時間
     */
    formatDateTimeROC: (isoString: string): string => {
        const date = new Date(isoString);
        const year = date.getFullYear() - 1911; // 轉換為民國年
        const formattedDate = new Intl.DateTimeFormat('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);

        return `${year}/${formattedDate}`;
    },

    /**
     * 將 ISO 日期字串轉換為完整民國年格式 民國YYY年MM月DD日
     *
     * @param {string} isoDate ISO 8601 格式的日期字串
     * @returns {string} 民國YYY年MM月DD日 格式的日期
     */
    formatISOToROC: (isoDate: string): string => {
        const date = new Date(isoDate);
        const rocYear = date.getFullYear() - 1911; // 計算民國年
        const month = date.getMonth() + 1; // getMonth() 從 0 開始，所以 +1
        const day = date.getDate();

        return `民國${rocYear}年${month}月${day}日`;
    }
};