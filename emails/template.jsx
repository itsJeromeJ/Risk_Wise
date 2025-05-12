import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { UserFinancialDataService } from "../lib/services/user-financial-data";

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  userId = "user123", // Default userId for testing
}) {
  const userFinancialDataService = UserFinancialDataService.getInstance();
  const userData = userFinancialDataService.getUserFinancialData(userId);

  if (!userData) {
    return (
      <Html>
        <Body>
          <Text>No financial data available for the user.</Text>
        </Body>
      </Html>
    );
  }

  const stats = {
    totalIncome: userData.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: userData.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
    byCategory: userData.transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {}),
  };

  // Generate AI insights dynamically using Gemini AI
  const insights = userFinancialDataService.generateFinancialInsights(userId);

  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>
            <Text style={styles.text}>Hello {userData.userName},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {new Date().toLocaleString("default", { month: "long" })}:
            </Text>

            {/* Main Stats */}
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>${stats.totalIncome.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>${stats.totalExpenses.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net Cash Flow</Text>
                <Text style={styles.heading}>
                  ${(stats.totalIncome - stats.totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            {/* Category Breakdown */}
            {stats.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(stats.byCategory).map(([category, amount]) => (
                  <div key={category} style={styles.row}>
                    <Text style={styles.text}>{category}</Text>
                    <Text style={styles.text}>${amount.toFixed(2)}</Text>
                  </div>
                ))}
              </Section>
            )}

            {/* AI Insights */}
            {insights && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>AI-Generated Insights</Heading>
                {insights.map((insight, index) => (
                  <Text key={index} style={styles.text}>
                    {insight}
                  </Text>
                ))}
              </Section>
            )}
          </Container>
        </Body>
      </Html>
    );
  }

  return null;
}