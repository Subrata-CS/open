# title: Sales analysis and forecast
# level: intermediate
# about: Monthly sales, growth rates, a linear trend and next month's forecast — the report a business actually asks for.
# tags: vectors, data frames, regression

months <- c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug")
sales  <- c(120400, 131200, 128900, 145600, 158300, 152700, 171500, 183200)

df <- data.frame(month = months, sales = sales, n = seq_along(sales))

df$growth <- c(NA, round(diff(df$sales) / head(df$sales, -1) * 100, 1))

cat("MONTHLY SALES\n")
for (i in seq_len(nrow(df))) {
  bar <- strrep("#", round(df$sales[i] / 8000))
  cat(sprintf("  %-4s %9s %7s  %s\n",
              df$month[i],
              format(df$sales[i], big.mark = ","),
              ifelse(is.na(df$growth[i]), "-", paste0(df$growth[i], "%")),
              bar))
}

cat(sprintf("\nTotal   : %s\n", format(sum(df$sales), big.mark = ",")))
cat(sprintf("Mean    : %s\n", format(round(mean(df$sales)), big.mark = ",")))
cat(sprintf("Best    : %s (%s)\n", df$month[which.max(df$sales)],
            format(max(df$sales), big.mark = ",")))
cat(sprintf("Std dev : %s\n", format(round(sd(df$sales)), big.mark = ",")))

model <- lm(sales ~ n, data = df)
slope <- round(coef(model)[2])
next_month <- round(predict(model, data.frame(n = nrow(df) + 1)))

cat(sprintf("\nTrend     : %s more per month\n", format(slope, big.mark = ",")))
cat(sprintf("R-squared : %.4f\n", summary(model)$r.squared))
cat(sprintf("September : %s forecast\n", format(next_month, big.mark = ",")))
