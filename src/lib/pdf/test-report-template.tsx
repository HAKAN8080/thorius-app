import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Türkçe karakter destekli font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#FAFAFA',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #6366F1',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: '#6366F1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 8,
    marginTop: 20,
  },
  date: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1px solid #E5E7EB',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
  },
  scoreName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    flex: 1,
  },
  scoreBarContainer: {
    flex: 2,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 6,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 700,
    width: 45,
    textAlign: 'right',
  },
  overallScore: {
    backgroundColor: '#6366F1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  overallLabel: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 36,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  analysisBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6366F1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 1.6,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 11,
    color: '#6366F1',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: 9,
    color: '#6366F1',
  },
});

// Renk seçici
const getScoreColor = (score: number): string => {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
};

export interface TestReportData {
  testName: string;
  testType: string;
  userName: string;
  completedAt: string;
  duration?: number;
  overallScore?: number;
  overallLabel?: string;
  dimensions: {
    id: string;
    name: string;
    score: number;
    color?: string;
  }[];
  analysis?: string;
  strengths?: string[];
  developmentAreas?: string[];
  recommendations?: string[];
}

export const TestReportPDF = ({ data }: { data: TestReportData }) => {
  const formattedDate = new Date(data.completedAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Thorius</Text>
          <Text style={styles.subtitle}>AI Destekli Kocluk ve Mentorluk Platformu</Text>
          <Text style={styles.title}>{data.testName}</Text>
          <Text style={styles.date}>
            {data.userName} | {formattedDate}
            {data.duration ? ` | ${data.duration} dakika` : ''}
          </Text>
        </View>

        {/* Overall Score */}
        {data.overallScore !== undefined && (
          <View style={styles.overallScore}>
            <Text style={styles.overallLabel}>
              {data.overallLabel || 'Genel Skor'}
            </Text>
            <Text style={styles.overallValue}>%{data.overallScore}</Text>
          </View>
        )}

        {/* Dimension Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boyut Skorlari</Text>
          {data.dimensions.map((dim) => (
            <View key={dim.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{dim.name}</Text>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      width: `${dim.score}%`,
                      backgroundColor: dim.color || getScoreColor(dim.score),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.scoreValue, { color: dim.color || getScoreColor(dim.score) }]}>
                %{dim.score}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Analysis */}
        {data.analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Analizi</Text>
            <View style={styles.analysisBox}>
              <Text style={styles.analysisText}>{data.analysis}</Text>
            </View>
          </View>
        )}

        {/* Strengths */}
        {data.strengths && data.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guclu Yonleriniz</Text>
            <View style={styles.analysisBox}>
              {data.strengths.map((item, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>✓</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Development Areas */}
        {data.developmentAreas && data.developmentAreas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gelisim Alanlari</Text>
            <View style={styles.analysisBox}>
              {data.developmentAreas.map((item, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>→</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oneriler</Text>
            <View style={styles.analysisBox}>
              {data.recommendations.map((item, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Thorius | Bu rapor otomatik olarak olusturulmustur.
          </Text>
          <Text style={styles.footerLink}>coaching.thorius.com.tr</Text>
        </View>
      </Page>
    </Document>
  );
};
