-- title: Matrix calculator
-- level: advanced
-- about: Multiply, transpose, find the determinant and invert a matrix — linear algebra written as pure functions.
-- tags: recursion, lists, purity

type Matrix = [[Double]]

transposeM :: Matrix -> Matrix
transposeM [] = []
transposeM ([]:_) = []
transposeM m = map head m : transposeM (map tail m)

multiply :: Matrix -> Matrix -> Matrix
multiply a b = [[sum (zipWith (*) row col) | col <- transposeM b] | row <- a]

minorOf :: Int -> Int -> Matrix -> Matrix
minorOf i j m =
  [ [ v | (cj, v) <- zip [0 ..] row, cj /= j ]
  | (ci, row) <- zip [0 ..] m, ci /= i ]

determinant :: Matrix -> Double
determinant [[x]] = x
determinant [[a, b], [c, d]] = a * d - b * c
determinant m =
  sum [ (-1) ^^ j * head m !! j * determinant (minorOf 0 j m)
      | j <- [0 .. length m - 1] ]

identity :: Int -> Matrix
identity n = [[if i == j then 1 else 0 | j <- [1 .. n]] | i <- [1 .. n]]

showM :: String -> Matrix -> IO ()
showM name m = do
  putStrLn (name ++ ":")
  mapM_ (\row -> putStrLn ("  " ++ unwords (map fmt row))) m
  where fmt x = let r = fromIntegral (round (x * 100) :: Int) / 100 in pad (show r)
        pad s = replicate (max 0 (8 - length s)) ' ' ++ s

main :: IO ()
main = do
  let a = [[2, -1, 0], [1, 3, 2], [0, 1, 1]] :: Matrix
      b = [[1, 0, 2], [0, 1, 0], [3, 0, 1]] :: Matrix

  showM "A" a
  showM "B" b
  showM "A x B" (multiply a b)
  showM "A transposed" (transposeM a)
  showM "identity(3)" (identity 3)

  putStrLn ("\ndet(A) = " ++ show (determinant a))
  putStrLn ("det(B) = " ++ show (determinant b))
  putStrLn ("A is " ++ (if determinant a /= 0 then "invertible" else "singular"))
