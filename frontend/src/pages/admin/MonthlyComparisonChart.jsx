import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import api from '../../lib/api';

export default function MonthlyComparisonChart({ theme, language, t }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [yearDataCache, setYearDataCache] = useState({});

  const currentTheme = theme === 'light' ? {
    accentBlue: '#3b82f6',
    accentGreen: '#10b981',
    textMuted: '#64748b',
    textPrimary: '#0f172a',
    bgCard: '#ffffff',
    border: 'rgba(15,23,42,0.08)'
  } : {
    accentBlue: '#0099ff',
    accentGreen: '#00d4aa',
    textMuted: '#94a3b8',
    textPrimary: '#ffffff',
    bgCard: '#141d2e',
    border: 'rgba(255,255,255,0.06)'
  };

  const fetchMonthlyData = async (year) => {
    // Check cache first
    if (yearDataCache[year]) {
      setChartData(yearDataCache[year]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/admin/monthly-comparison?year=${year}`);
      
      // Month names in different languages
      const monthNames = {
        FR: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        AR: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      };
      
      const months = monthNames[language] || monthNames['FR'];
      
      // Transform API data to chart format
      const transformedData = Array.from({ length: 12 }, (_, i) => {
        const monthData = response.data.find(d => d.month === (i + 1));
        return {
          month: months[i],
          factures: monthData?.factures || 0,
          generations: monthData?.declarations || 0
        };
      });
      
      // Cache the data
      setYearDataCache(prev => ({ ...prev, [year]: transformedData }));
      setChartData(transformedData);
    } catch (error) {
      // Fallback to empty data with month names
      const monthNames = {
        'FR': ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        'EN': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'AR': ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      };
      const months = monthNames[language] || monthNames['FR'];
      const emptyData = Array.from({ length: 12 }, (_, i) => ({
        month: months[i],
        factures: 0,
        generations: 0
      }));
      
      // Cache empty data for this year
      setYearDataCache(prev => ({ ...prev, [year]: emptyData }));
      setChartData(emptyData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get('/admin/available-years');
        const apiYears = response.data.years || [];
        
        // Ensure current year and next year are always available
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set([...apiYears, currentYear, currentYear + 1]);
        
        // Add previous 2 years if not present
        yearsSet.add(currentYear - 1);
        yearsSet.add(currentYear - 2);
        
        setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
      } catch (error) {
        // Fallback to current year and surrounding years
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear - 2, currentYear - 1, currentYear, currentYear + 1]);
      }
    };
    fetchYears();
  }, []);

  // Fetch data when year changes
  useEffect(() => {
    fetchMonthlyData(selectedYear);
  }, [selectedYear]);

  // Refresh chart when language changes (use cached data with new month names)
  useEffect(() => {
    if (chartData.length > 0) {
      const monthNames = {
        FR: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        AR: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      };
      const months = monthNames[language] || monthNames['FR'];
      
      setChartData(prev => prev.map((item, i) => ({
        ...item,
        month: months[i]
      })));
    }
  }, [language]);

  const years = availableYears.length > 0 ? availableYears : [new Date().getFullYear()];

  const handlePreviousYear = () => {
    const currentIndex = years.indexOf(selectedYear);
    if (currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1]);
    } else {
      // Add a new year to the beginning
      const newYear = years[0] - 1;
      setAvailableYears([newYear, ...years]);
      setSelectedYear(newYear);
    }
  };

  const handleNextYear = () => {
    const currentIndex = years.indexOf(selectedYear);
    if (currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1]);
    } else {
      // Add a new year to the end
      const newYear = years[years.length - 1] + 1;
      setAvailableYears([...years, newYear]);
      setSelectedYear(newYear);
    }
  };

  return (
    <div style={{
      background: currentTheme.bgCard,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: 16,
      padding: 28,
      backdropFilter: 'blur(12px)',
      boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
    }}>
      {/* Header with Year Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: currentTheme.textPrimary }}>
          📊 {language === 'FR' ? 'Factures & Générations par mois' : language === 'EN' ? 'Monthly Invoices & Generations' : 'الفواتير والأجيال الشهرية'}
        </div>
        
        {/* Year Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Previous Year Button */}
          <button
            onClick={handlePreviousYear}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: 8,
              color: currentTheme.textMuted,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(16,185,129,0.1)`;
              e.target.style.borderColor = currentTheme.accentGreen;
              e.target.style.color = currentTheme.accentGreen;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = currentTheme.border;
              e.target.style.color = currentTheme.textMuted;
            }}
            title={language === 'FR' ? 'Année précédente' : language === 'EN' ? 'Previous year' : 'السنة السابقة'}
          >
            ←
          </button>

          {/* Year Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 16px',
                  background: selectedYear === year 
                    ? `linear-gradient(135deg, ${currentTheme.accentGreen}, ${currentTheme.accentBlue})`
                    : 'transparent',
                  border: `1px solid ${selectedYear === year ? 'transparent' : currentTheme.border}`,
                  borderRadius: 8,
                  color: selectedYear === year ? '#ffffff' : currentTheme.textMuted,
                  fontWeight: selectedYear === year ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedYear !== year) {
                    e.target.style.background = `rgba(16,185,129,0.1)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedYear !== year) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Next Year Button */}
          <button
            onClick={handleNextYear}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: 8,
              color: currentTheme.textMuted,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(16,185,129,0.1)`;
              e.target.style.borderColor = currentTheme.accentGreen;
              e.target.style.color = currentTheme.accentGreen;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = currentTheme.border;
              e.target.style.color = currentTheme.textMuted;
            }}
            title={language === 'FR' ? 'Année suivante' : language === 'EN' ? 'Next year' : 'السنة التالية'}
          >
            →
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.textMuted }}>
          {language === 'FR' ? 'Chargement...' : language === 'EN' ? 'Loading...' : 'جاري التحميل...'}
        </div>
      ) : (
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.border} />
              <XAxis 
                dataKey="month" 
                stroke={currentTheme.textMuted} 
                tick={{ fill: currentTheme.textMuted, fontSize: 12 }} 
              />
              <YAxis 
                stroke={currentTheme.textMuted} 
                tick={{ fill: currentTheme.textMuted, fontSize: 12 }} 
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: currentTheme.bgCard,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary
                }}
                labelStyle={{ color: currentTheme.textPrimary, fontWeight: 600 }}
              />
              <Legend 
                wrapperStyle={{ color: currentTheme.textPrimary }}
                iconType="circle"
              />
              <Bar 
                dataKey="factures" 
                fill={currentTheme.accentBlue} 
                name={language === 'FR' ? 'Factures' : language === 'EN' ? 'Invoices' : 'الفواتير'}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="generations" 
                fill={currentTheme.accentGreen} 
                name={language === 'FR' ? 'Générations' : language === 'EN' ? 'Generations' : 'الأجيال'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 16, 
        marginTop: 20,
        paddingTop: 20,
        borderTop: `1px solid ${currentTheme.border}`
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 4 }}>
            {language === 'FR' ? 'Total Factures' : language === 'EN' ? 'Total Invoices' : 'إجمالي الفواتير'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: currentTheme.accentBlue }}>
            {chartData.reduce((sum, item) => sum + Number(item.factures || 0), 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 4 }}>
            {language === 'FR' ? 'Total Générations' : language === 'EN' ? 'Total Generations' : 'إجمالي الأجيال'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: currentTheme.accentGreen }}>
            {chartData.reduce((sum, item) => sum + Number(item.generations || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
