// https://adrian-salajan.github.io/blog/2021/01/25/images-functor 에서 수정됨
// `npm run functor` 명령어로 실행

import { Endomorphism } from 'fp-ts/function'
import * as R from 'fp-ts/Reader'

// -------------------------------------------------------------------------------------
// 모델
// -------------------------------------------------------------------------------------

type Color = {
  readonly red: number
  readonly green: number
  readonly blue: number
}

type Point = {
  readonly x: number
  readonly y: number
}

type Image<A> = R.Reader<Point, A>

// -------------------------------------------------------------------------------------
// 생성자
// -------------------------------------------------------------------------------------

const color = (red: number, green: number, blue: number): Color => ({
  red,
  green,
  blue
})

const BLACK: Color = color(0, 0, 0)

const WHITE: Color = color(255, 255, 255)

// -------------------------------------------------------------------------------------
// 결합자
// -------------------------------------------------------------------------------------

const brightness = (color: Color): number =>
  (color.red + color.green + color.blue) / 3

export const grayscale = (c: Color): Color => {
  const n = brightness(c)
  return color(n, n, n)
}

export const invert = (c: Color): Color =>
  color(255 - c.red, 255 - c.green, 255 - c.red)

// 밝기가 어떤 값 V보다 크면 흰색을 넣고 그렇지 않으면 검은색을 넣습니다.
export const threshold = (c: Color): Color =>
  brightness(c) < 100 ? BLACK : WHITE

// -------------------------------------------------------------------------------------
// 메인
// -------------------------------------------------------------------------------------

// `main`은 변환 함수, 즉 `Endomorphism<Image<RGB>>`를 전달해 호출해야 합니다.
main(R.map((c: Color) => c))
// main(R.map(grayscale))
// main(R.map(invert))
// main(R.map(threshold))

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

function main(f: Endomorphism<Image<Color>>) {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as any
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as any
  const bird: HTMLImageElement = document.getElementById('bird') as any
  bird.onload = function () {
    console.log('hello')
    function getImage(imageData: ImageData): Image<Color> {
      const data = imageData.data
      return (loc) => {
        const pos = loc.x * 4 + loc.y * 632 * 4
        return color(data[pos], data[pos + 1], data[pos + 2])
      }
    }

    function setImage(imageData: ImageData, image: Image<Color>): void {
      const data = imageData.data
      for (let x = 0; x < 632; x++) {
        for (let y = 0; y < 421; y++) {
          const pos = x * 4 + y * 632 * 4
          const { red, green, blue } = image({ x, y })
          data[pos] = red
          data[pos + 1] = green
          data[pos + 2] = blue
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    ctx.drawImage(bird, 0, 0)
    const imageData = ctx.getImageData(0, 0, 632, 421)
    setImage(imageData, f(getImage(imageData)))
  }
}
