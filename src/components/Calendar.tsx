import { Platform, NativeModules } from 'react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { CalendarDay } from '@constants/types';
import { rose_callendar } from '@/styles';
import { rose_theme } from '@constants/rose_theme';

// Configure Portuguese locale
LocaleConfig.locales['pt'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    dayNames: [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};

const getSystemLocale = (): string => {
    let locale = 'pt';
    
    try {
        if (Platform.OS === 'ios') {
            locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
                    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'pt';
        } else {
            locale = NativeModules.I18nManager?.localeIdentifier || 'pt';
        }
        
        locale = locale.split(/[-_]/)[0].toLowerCase();
        
        if (locale === 'pt') {
            return 'pt';
        }

        return LocaleConfig.locales[locale] ? locale : 'en';
    } catch (error) {
        console.error(error);
        return 'en';
    }
};

LocaleConfig.defaultLocale = getSystemLocale();

interface CalendarProps {
    selectedDate: string;
    onDayPress: (day: CalendarDay) => void;
}

export default function Calendar({ selectedDate, onDayPress }: CalendarProps) {
    return (
        <RNCalendar
            onDayPress={onDayPress}
            markedDates={{[selectedDate]: { selected: true, selectedColor: rose_theme.rose_lightest }}}
            theme={rose_callendar}
            monthFormat={'MMMM yyyy'}
            disableMonthChange={false}
            firstDay={0}
            hideDayNames={false}
            showWeekNumbers={false}
            disableArrowLeft={false}
            disableArrowRight={false}
            enableSwipeMonths={true}
        />
    );
}