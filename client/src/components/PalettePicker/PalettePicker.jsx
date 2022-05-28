import React, { useState, useEffect, useContext, useRef } from 'react'

import * as S from './PalettePicker.styled.jsx'
import { PaletteContext } from '../../context/PaletteContext.js'
import { KeyboardNavigationContext } from '../../context/KeyboardNavigationContext.js'

import { paletteColors } from '../../utils/paletteColors.js'
import gsap from 'gsap'
import KeyboardIcon from '../KeyboardIcon/KeyboardIcon.jsx'
import { useWindowSize } from './../../hooks/useWindowSize.js'

const PalettePicker = () => {
  const [isSwitcherDisabled, setIsSwitcherDisabled] = useState(false)

  const {
    palette,
    setPalette,
    paletteAnimationEnabled,
    setPaletteAnimationEnabled,
    rolledOut,
    setRolledOut,
  } = useContext(PaletteContext)
  const { Refs, visibility } = useContext(KeyboardNavigationContext)
  const { keysVisible, setKeysVisible } = visibility

  const FirstColorRef = useRef()
  const SecondColorRef = useRef()
  const ThirdColorRef = useRef()
  const FourthColorRef = useRef()

  const SwitcherContainerRef = useRef()
  const MainPaletteRef = useRef()
  const PaletteRestRef = useRef([])

  const size = useWindowSize()

  useEffect(() => {
    localStorage.setItem('palette', JSON.stringify(palette))
  }, [palette])

  const rollOut = () => {
    var tl = gsap.timeline({
      onComplete: () => {
        SwitcherContainerRef.current.style.pointerEvents = 'auto'
        setIsSwitcherDisabled(false)
        setRolledOut(true)
        setPaletteAnimationEnabled(true)
      },
    })
    tl.to(ThirdColorRef.current, {
      rotation: '-180',
      transformOrigin: 'left bottom',
    })
      .to(
        FourthColorRef.current,
        {
          x: -40,
        },
        '-=0.4',
      )
      .to(
        FourthColorRef.current,
        {
          rotation: '-180',
          transformOrigin: 'left bottom',
        },
        '-=0.2',
      )
      .to(
        PaletteRestRef.current,
        {
          opacity: 1,
          display: 'flex',
          y: 20,
          ease: 'Bounce.easeOut',
          stagger: {
            each: 0.3,
          },
        },
        '-=0.1',
      )
  }

  const rollIn = () => {
    var tl = gsap.timeline({
      onComplete: () => {
        SwitcherContainerRef.current.style.pointerEvents = 'auto'
        setIsSwitcherDisabled(false)
        setRolledOut(false)
        setPaletteAnimationEnabled(true)
      },
    })
    tl.to(PaletteRestRef.current, {
      opacity: 0,
      display: 'none',
      y: 0,
      stagger: {
        each: 0.1,
        from: 'end',
        ease: 'Power3.easeOuteaseOut',
      },
    })
      .to(FourthColorRef.current, {
        rotation: '0',
        transformOrigin: 'left bottom',
      })
      .to(
        FourthColorRef.current,
        {
          x: 0,
        },
        '-=0.2',
      )
      .to(
        ThirdColorRef.current,
        {
          rotation: '0',
          transformOrigin: 'left bottom',
        },
        '-=0.4',
      )
  }

  // gather refs for keyboard keys
  useEffect(() => {
    Refs['MainPaletteRef'] = MainPaletteRef
    Refs['SwitcherContainerRef'] = SwitcherContainerRef
    Refs['PaletteRestRef'] = PaletteRestRef
  }, [paletteAnimationEnabled])

  // populating array with the rest of the palette that doesn't mach current palette
  var restOfColors = []
  for (const [key, value] of Object.entries(paletteColors)) {
    if (JSON.stringify(value) !== JSON.stringify(palette)) {
      restOfColors.push({ value })
    }
  }

  let restOfPalett = []
  let counter = 0

  for (var el in restOfColors) {
    const value = restOfColors[el].value
    var top = 20 + counter * 20
    const e = counter
    restOfPalett.push(
      <S.PaletteContainer
        top={`${top}px`}
        ref={(el) => (PaletteRestRef.current[e] = el)}
        onClick={() => {
          // when clicked, this palettet becomes the first one and there's empty row
          // because we don't repeat the main palette and those to choose from
          var temp = e
          var previous_palette = palette
          setPalette(value)
        }}
        opacity={'0'}
        key={el}
      >
        {rolledOut && keysVisible ? (
          <KeyboardIcon
            buttonKey={Number(el) + 2}
            shape={'straight'}
            size={size.width > 600 ? 'large' : 'small'}
            horizontal={'left'}
            right={0}
            top={5}
          />
        ) : (
          ''
        )}
        <S.SingleColor color={value.color4} />
        <S.SingleColor color={value.color3} />
        <S.SingleColor color={value.color2} />
        <S.SingleColor color={value.color1} />
      </S.PaletteContainer>,
    )
    counter += 1
  }

  return (
    <S.ColorSwitcherContainer
      onClick={() => {
        if (!isSwitcherDisabled) {
          if (rolledOut) {
            setIsSwitcherDisabled(true)
            setPaletteAnimationEnabled(false)
            SwitcherContainerRef.current.style.pointerEvents = 'none'
            rollIn()
          } else {
            setIsSwitcherDisabled(true)
            setPaletteAnimationEnabled(false)
            SwitcherContainerRef.current.style.pointerEvents = 'none'
            rollOut()
          }
        }
      }}
      ref={SwitcherContainerRef}
    >
      <S.PaletteContainer top={'0px'} opacity={'1'} display={'grid'} ref={MainPaletteRef}>
        <S.SingleColor ref={ThirdColorRef} color={palette.color3} />
        <S.SingleColor ref={FourthColorRef} color={palette.color4} />
        <S.SingleColor ref={SecondColorRef} color={palette.color2} />
        <S.SingleColor ref={FirstColorRef} color={palette.color1} />
        {rolledOut && keysVisible ? (
          <KeyboardIcon
            buttonKey={'1'}
            shape={'straight'}
            size={size.width > 600 ? 'large' : 'small'}
            horizontal={'left'}
            right={0}
            top={25}
          />
        ) : (
          ''
        )}
      </S.PaletteContainer>
      {restOfPalett}
    </S.ColorSwitcherContainer>
  )
}

export default PalettePicker
