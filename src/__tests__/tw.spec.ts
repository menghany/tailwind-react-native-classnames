import rn from 'react-native';
import { describe, test, expect } from '@jest/globals';
import { create } from '../';
import { TwConfig } from '../tw-config';

jest.mock(`react-native`, () => ({
  Platform: { OS: `ios` },
}));

describe(`tw`, () => {
  let tw = create();
  beforeEach(() => (tw = create()));

  test(`media queries`, () => {
    const config: TwConfig = { theme: { screens: { md: `768px` } } };
    tw = create(config);
    tw.setWindowDimensions({ width: 500, height: 500 });
    expect(tw`md:text-lg text-xs`).toMatchObject({ fontSize: 12 });
    tw.setWindowDimensions({ width: 800, height: 500 });
    expect(tw`md:text-lg text-xs`).toMatchObject({ fontSize: 18 });
  });

  test(`multiple media queries`, () => {
    const config: TwConfig = { theme: { screens: { sm: `640px`, md: `768px` } } };
    tw = create(config);
    tw.setWindowDimensions({ width: 800, height: 0 });
    expect(tw`text-xs sm:text-md md:text-lg`).toMatchObject({ fontSize: 18 });
    // out of order
    expect(tw`md:text-lg sm:text-base text-xs`).toMatchObject({ fontSize: 18 });
    expect(tw`sm:text-base md:text-lg text-xs`).toMatchObject({ fontSize: 18 });
    expect(tw`md:text-lg text-xs sm:text-base`).toMatchObject({ fontSize: 18 });
  });

  test(`media queries + dependent style`, () => {
    const config: TwConfig = { theme: { screens: { md: `768px` } } };
    tw = create(config);
    tw.setWindowDimensions({ width: 800, height: 0 });
    expect(tw`text-xs leading-none md:leading-tight`).toMatchObject({
      fontSize: 12,
      lineHeight: 15,
    });
  });

  test(`orientation utilities`, () => {
    tw = create();
    tw.setWindowDimensions({ width: 600, height: 800 });
    expect(tw`mt-0 landscape:mt-1`).toMatchObject({ marginTop: 0 });
    expect(tw`landscape:mt-1 mt-0`).toMatchObject({ marginTop: 0 });
    expect(tw`landscape:mt-1 mt-0 portrait:mt-2`).toMatchObject({ marginTop: 8 });
    expect(tw`mt-0 portrait:mt-2 landscape:mt-1`).toMatchObject({ marginTop: 8 });
    tw = create();
    tw.setWindowDimensions({ width: 800, height: 600 });
    expect(tw`mt-0 landscape:mt-1`).toMatchObject({ marginTop: 4 });
    expect(tw`landscape:mt-1 mt-0`).toMatchObject({ marginTop: 4 });
    tw = create();
    expect(tw`mt-0 landscape:mt-1 portrait:mt-2`).toMatchObject({ marginTop: 0 });
    expect(tw`landscape:mt-1 mt-0 portrait:mt-2`).toMatchObject({ marginTop: 0 });
  });

  test(`multiple prefixes`, () => {
    rn.Platform.OS = `android`;
    const config: TwConfig = { theme: { screens: { md: `768px` } } };
    tw = create(config);
    tw.setWindowDimensions({ width: 800, height: 0 });
    tw.setColorScheme(`dark`);
    expect(
      tw`android:md:text-xs android:text-2xl ios:text-lg android:dark:mt-2 mt-1`,
    ).toMatchObject({
      fontSize: 12,
      marginTop: 8,
    });
  });

  test(`platform-matching`, () => {
    rn.Platform.OS = `ios`;
    tw = create();
    expect(tw`android:text-lg ios:text-xs`).toMatchObject({ fontSize: 12 });
    rn.Platform.OS = `android`;
    tw = create();
    expect(tw`android:text-lg ios:text-xs`).toMatchObject({ fontSize: 18 });
  });

  test(`font-size`, () => {
    expect(tw`text-sm`).toMatchObject({
      fontSize: 14,
      lineHeight: 20,
    });
  });

  test(`customized font-size variations`, () => {
    tw = create({ theme: { fontSize: { xs: `0.75rem` } } });

    expect(tw`text-xs`).toMatchObject({ fontSize: 12 });

    tw = create({ theme: { fontSize: { xs: [`0.75rem`, `0.75rem`] } } });
    expect(tw`text-xs`).toMatchObject({ fontSize: 12, lineHeight: 12 });

    tw = create({ theme: { fontSize: { xs: [`0.75rem`, { lineHeight: `0.75rem` }] } } });
    expect(tw`text-xs`).toMatchObject({ fontSize: 12, lineHeight: 12 });

    tw = create({ theme: { fontSize: { xs: [`0.75rem`, { letterSpacing: `1px` }] } } });
    expect(tw`text-xs`).toMatchObject({ fontSize: 12, letterSpacing: 1 });

    tw = create({
      theme: {
        fontSize: { xs: [`0.75rem`, { lineHeight: `0.5rem`, letterSpacing: `1px` }] },
      },
    });
    expect(tw`text-xs`).toMatchObject({ fontSize: 12, letterSpacing: 1, lineHeight: 8 });
  });

  const relativeLineHeight: Array<[string, number, number]> = [
    [`text-xs leading-none`, 12, 12],
    [`text-xs leading-tight`, 12, 15],
    [`text-xs leading-snug`, 12, 16.5],
    [`text-xs leading-normal`, 12, 18],
    [`text-xs leading-relaxed`, 12, 19.5],
    [`text-xs leading-loose`, 12, 24],
  ];

  test.each(relativeLineHeight)(
    `line-height derived from font size "%s"`,
    (classes, fontSize, lineHeight) => {
      expect(tw`${classes}`).toMatchObject({ fontSize, lineHeight });
    },
  );

  const absoluteLineHeight: Array<[string, number]> = [
    [`leading-3`, 12],
    [`leading-4`, 16],
    [`leading-5`, 20],
    [`leading-6`, 24],
    [`leading-7`, 28],
    [`leading-8`, 32],
    [`leading-9`, 36],
    [`leading-[333px]`, 333],
  ];

  test.each(absoluteLineHeight)(
    `absolute line-height "%s" -> %dpx`,
    (classes, lineHeight) => {
      expect(tw`${classes}`).toMatchObject({ lineHeight });
    },
  );

  test(`customized line-height`, () => {
    tw = create({ theme: { lineHeight: { '5': `2rem`, huge: `400px` } } });
    expect(tw`leading-5`).toMatchObject({ lineHeight: 32 });
    expect(tw`leading-huge`).toMatchObject({ lineHeight: 400 });
  });

  test(`font-family`, () => {
    expect(tw`font-sans`).toMatchObject({ fontFamily: `ui-sans-serif` });
    tw = create({ theme: { fontFamily: { sans: `font1`, serif: [`font2`, `font3`] } } });
    expect(tw`font-sans`).toMatchObject({ fontFamily: `font1` });
    expect(tw`font-serif`).toMatchObject({ fontFamily: `font2` });
  });

  test(`negated values`, () => {
    expect(tw`-mt-1 -pb-2`).toMatchObject({ marginTop: -4, paddingBottom: -8 });
  });

  test(`arbitrary value`, () => {
    expect(tw`mt-[333px]`).toMatchObject({ marginTop: 333 });
    expect(tw`mt-[-333px]`).toMatchObject({ marginTop: -333 });
    expect(tw`-mt-[333px]`).toMatchObject({ marginTop: -333 });
  });

  test(`aspect-ratio`, () => {
    expect(tw`aspect-ratio-1`).toMatchObject({ aspectRatio: 1 });
    expect(tw`aspect-ratio-4`).toMatchObject({ aspectRatio: 4 });
    expect(tw`aspect-ratio-0.5`).toMatchObject({ aspectRatio: 0.5 });
    expect(tw`aspect-ratio-.5`).toMatchObject({ aspectRatio: 0.5 });
    expect(tw`aspect-ratio-16/9`).toMatchObject({ aspectRatio: 16 / 9 });
  });

  test(`elevation (android-only)`, () => {
    expect(tw`elevation-1`).toMatchObject({ elevation: 1 });
    expect(tw`elevation-2`).toMatchObject({ elevation: 2 });
    expect(tw`elevation-17`).toMatchObject({ elevation: 17 });
  });

  describe(`font-variant-numeric support`, () => {
    test(`oldstyle-nums`, () => {
      expect(tw`oldstyle-nums`).toEqual({ fontVariant: [`oldstyle-nums`] });
    });

    test(`lining-nums`, () => {
      expect(tw`lining-nums`).toEqual({ fontVariant: [`lining-nums`] });
    });

    test(`tabular-nums`, () => {
      expect(tw`tabular-nums`).toEqual({ fontVariant: [`tabular-nums`] });
    });

    test(`proportional-nums`, () => {
      expect(tw`proportional-nums`).toEqual({ fontVariant: [`proportional-nums`] });
    });

    test(`multiple font variants`, () => {
      expect(tw`oldstyle-nums lining-nums tabular-nums proportional-nums`).toEqual({
        fontVariant: [
          `oldstyle-nums`,
          `lining-nums`,
          `tabular-nums`,
          `proportional-nums`,
        ],
      });
    });
  });

  test(`opacity-X`, () => {
    expect(tw`opacity-0`).toMatchObject({ opacity: 0 });
    expect(tw`opacity-5`).toMatchObject({ opacity: 0.05 });
    expect(tw`opacity-50`).toMatchObject({ opacity: 0.5 });
    expect(tw`opacity-100`).toMatchObject({ opacity: 1 });
    // arbitrary
    expect(tw`opacity-73`).toMatchObject({ opacity: 0.73 });
  });

  test(`tw.color()`, () => {
    expect(tw.color(`black`)).toBe(`#000`);
    expect(tw.color(`bg-black`)).toBe(`#000`); // incorrect usage, but still works
    expect(tw.color(`white/25`)).toBe(`rgba(255, 255, 255, 0.25)`);
    expect(tw.color(`black opacity-50`)).toBe(`rgba(0, 0, 0, 0.5)`);
    expect(tw.color(`red-500`)).toBe(`#ef4444`);
  });

  test(`merging in user styles`, () => {
    expect(tw.style(`bg-black`, { textShadowColor: `#ff0` })).toMatchObject({
      backgroundColor: `#000`,
      textShadowColor: `#ff0`,
    });

    expect(tw.style({ lineHeight: 16 }, { elevation: 3 })).toMatchObject({
      lineHeight: 16,
      elevation: 3,
    });
  });

  test(`mapped style after platform prefix works`, () => {
    rn.Platform.OS = `ios`;
    tw = create();
    expect(tw`ios:hidden`).toMatchObject({ display: `none` });
  });

  test(`style-object only doesn't confuse cache`, () => {
    expect(tw.style({ width: 90 })).toMatchObject({ width: 90 });
    expect(tw.style({ width: 40 })).toMatchObject({ width: 40 });
  });

  test(`rn style objects don't confuse cache`, () => {
    expect(tw.style(`pt-1`, { width: 90 })).toMatchObject({ paddingTop: 4, width: 90 });
    expect(tw.style(`pt-1`, { width: 100 })).toMatchObject({ paddingTop: 4, width: 100 });
  });

  test(`unknown prefixes produce null styles`, () => {
    expect(tw`w-1 foo:w-2`.width).toBe(4);
    expect(tw`lol:hidden`.display).toBeUndefined();
  });

  test(`retina prefix`, () => {
    expect(tw`w-1 retina:w-2`.width).toBe(4);
    expect(tw`retina:w-2 w-1`.width).toBe(4);
    tw.setPixelDensity(1);
    expect(tw`w-1 retina:w-2`.width).toBe(4);
    expect(tw`retina:w-2 w-1`.width).toBe(4);
    tw.setPixelDensity(2);
    expect(tw`w-1 retina:w-2`.width).toBe(8);
    expect(tw`retina:w-2 w-1`.width).toBe(8);
  });

  // @see https://github.com/jaredh159/tailwind-react-native-classnames/issues/60
  test(`user styles not mixed into cache`, () => {
    const style = tw.style(`text-base mb-4`, { opacity: 0.5 });
    expect(Object.keys(style)).toHaveLength(4);
    expect(style).toMatchObject({
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 16,
      opacity: 0.5,
    });

    const style2 = tw`text-base mb-4`;
    expect(Object.keys(style2)).toHaveLength(3);
    expect(style2).toMatchObject({
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 16,
    });
  });
});
