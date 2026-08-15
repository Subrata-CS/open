// title: URL shortener
// level: intermediate
// about: The whole idea behind bit.ly — a base62 counter, a two-way map, and hit counting.
// tags: maps, encoding, structs

package main

import (
	"fmt"
	"sort"
	"strings"
)

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type Shortener struct {
	next   int
	toLong map[string]string
	toCode map[string]string
	hits   map[string]int
}

func New() *Shortener {
	return &Shortener{next: 1000, toLong: map[string]string{}, toCode: map[string]string{}, hits: map[string]int{}}
}

func encode(n int) string {
	if n == 0 {
		return string(alphabet[0])
	}
	var sb strings.Builder
	for n > 0 {
		sb.WriteByte(alphabet[n%62])
		n /= 62
	}
	runes := []byte(sb.String())
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func (s *Shortener) Shorten(long string) string {
	if code, seen := s.toCode[long]; seen {
		return code
	}
	code := encode(s.next)
	s.next++
	s.toLong[code] = long
	s.toCode[long] = code
	return code
}

func (s *Shortener) Resolve(code string) (string, bool) {
	long, ok := s.toLong[code]
	if ok {
		s.hits[code]++
	}
	return long, ok
}

func main() {
	s := New()
	links := []string{
		"https://subrata-cs.github.io/open/docs/machine-learning",
		"https://subrata-cs.github.io/open/playground",
		"https://subrata-cs.github.io/open/docs/machine-learning",
	}

	for _, l := range links {
		fmt.Printf("%-58s -> /%s\n", l[:min(58, len(l))], s.Shorten(l))
	}

	fmt.Println()
	for _, code := range []string{"qi", "qj", "zz"} {
		if long, ok := s.Resolve(code); ok {
			s.Resolve(code)
			fmt.Printf("/%s  ->  %s\n", code, long)
		} else {
			fmt.Printf("/%s  ->  404 not found\n", code)
		}
	}

	fmt.Println("\nHITS")
	codes := make([]string, 0, len(s.hits))
	for c := range s.hits {
		codes = append(codes, c)
	}
	sort.Strings(codes)
	for _, c := range codes {
		fmt.Printf("  /%s %d\n", c, s.hits[c])
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
