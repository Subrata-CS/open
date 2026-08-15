#!/usr/bin/env bash
# title: Server log analyser
# level: intermediate
# about: Parses an access log into traffic, error rates and the busiest paths — the first thing you run when a site slows down.
# tags: awk, pipelines, reporting

set -euo pipefail

cat > /tmp/access.log <<'LOG'
10.0.0.4 - [15/Aug/2026:09:12:01] "GET /open/ HTTP/1.1" 200 5120 0.031
10.0.0.9 - [15/Aug/2026:09:12:04] "GET /open/docs HTTP/1.1" 200 8100 0.052
10.0.0.4 - [15/Aug/2026:09:12:09] "GET /open/missing HTTP/1.1" 404 512 0.004
10.0.1.7 - [15/Aug/2026:09:13:22] "GET /open/playground HTTP/1.1" 200 22400 0.180
10.0.0.9 - [15/Aug/2026:09:14:02] "POST /api/run HTTP/1.1" 500 300 1.902
10.0.1.7 - [15/Aug/2026:09:14:31] "GET /open/docs HTTP/1.1" 200 8100 0.048
10.0.2.2 - [15/Aug/2026:09:15:10] "GET /open/missing HTTP/1.1" 404 512 0.006
10.0.1.7 - [15/Aug/2026:09:15:44] "GET /open/docs HTTP/1.1" 200 8100 0.061
LOG

total=$(wc -l < /tmp/access.log)
echo "Requests analysed: $total"
echo

echo "STATUS CODES"
awk '{print $(NF-2)}' /tmp/access.log | sort | uniq -c | sort -rn |
  while read -r count code; do
    printf "  %-5s %3d  %5.1f%%\n" "$code" "$count" "$(echo "$count $total" | awk '{print $1*100/$2}')"
  done

errors=$(awk '$(NF-2) ~ /^[45]/' /tmp/access.log | wc -l)
echo
printf "Error rate: %.1f%%\n" "$(echo "$errors $total" | awk '{print $1*100/$2}')"

echo
echo "BUSIEST PATHS"
awk -F'"' '{split($2, r, " "); print r[2]}' /tmp/access.log | sort | uniq -c | sort -rn | head -3 |
  while read -r count path; do printf "  %3d  %s\n" "$count" "$path"; done

echo
echo "SLOWEST REQUESTS"
sort -k NF -g -r /tmp/access.log | head -2 |
  awk -F'"' '{split($2, r, " "); n=split($3, t, " "); printf "  %6.3fs  %s\n", t[n], r[2]}'

echo
echo "UNIQUE VISITORS: $(awk '{print $1}' /tmp/access.log | sort -u | wc -l)"
