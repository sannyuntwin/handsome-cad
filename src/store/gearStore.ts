"use client";

import { create } from "zustand";
import { DEFAULT_BOLT_PARAMETERS } from "@/features/bolt/defaults";
import type { BoltParameters } from "@/features/bolt/types";
import { DEFAULT_BRACKET_PARAMETERS } from "@/features/bracket/defaults";
import type { BracketParameters } from "@/features/bracket/types";
import { DEFAULT_GEAR_PARAMETERS } from "@/features/gear/defaults";
import type { GearParameters } from "@/features/gear/types";
import { DEFAULT_NUT_PARAMETERS } from "@/features/nut/defaults";
import type { NutParameters } from "@/features/nut/types";
import type { PartType } from "@/features/part/types";
import { DEFAULT_PULLEY_PARAMETERS } from "@/features/pulley/defaults";
import type { PulleyParameters } from "@/features/pulley/types";
import { DEFAULT_SHAFT_PARAMETERS } from "@/features/shaft/defaults";
import type { ShaftParameters } from "@/features/shaft/types";
import { DEFAULT_WASHER_PARAMETERS } from "@/features/washer/defaults";
import type { WasherParameters } from "@/features/washer/types";

interface GearState {
  partType: PartType;
  gearParameters: GearParameters;
  shaftParameters: ShaftParameters;
  pulleyParameters: PulleyParameters;
  boltParameters: BoltParameters;
  nutParameters: NutParameters;
  washerParameters: WasherParameters;
  bracketParameters: BracketParameters;
  setPartType: (partType: PartType) => void;
  setGearParameter: <K extends keyof GearParameters>(key: K, value: GearParameters[K]) => void;
  setShaftParameter: <K extends keyof ShaftParameters>(key: K, value: ShaftParameters[K]) => void;
  setPulleyParameter: <K extends keyof PulleyParameters>(key: K, value: PulleyParameters[K]) => void;
  setBoltParameter: <K extends keyof BoltParameters>(key: K, value: BoltParameters[K]) => void;
  setNutParameter: <K extends keyof NutParameters>(key: K, value: NutParameters[K]) => void;
  setWasherParameter: <K extends keyof WasherParameters>(key: K, value: WasherParameters[K]) => void;
  setBracketParameter: <K extends keyof BracketParameters>(key: K, value: BracketParameters[K]) => void;
  resetCurrentPart: () => void;
}

export const useGearStore = create<GearState>((set) => ({
  partType: "gear",
  gearParameters: DEFAULT_GEAR_PARAMETERS,
  shaftParameters: DEFAULT_SHAFT_PARAMETERS,
  pulleyParameters: DEFAULT_PULLEY_PARAMETERS,
  boltParameters: DEFAULT_BOLT_PARAMETERS,
  nutParameters: DEFAULT_NUT_PARAMETERS,
  washerParameters: DEFAULT_WASHER_PARAMETERS,
  bracketParameters: DEFAULT_BRACKET_PARAMETERS,
  setPartType: (partType) => set({ partType }),
  setGearParameter: (key, value) =>
    set((state) => ({
      gearParameters: {
        ...state.gearParameters,
        [key]: value
      }
    })),
  setShaftParameter: (key, value) =>
    set((state) => ({
      shaftParameters: {
        ...state.shaftParameters,
        [key]: value
      }
    })),
  setPulleyParameter: (key, value) =>
    set((state) => ({
      pulleyParameters: {
        ...state.pulleyParameters,
        [key]: value
      }
    })),
  setBoltParameter: (key, value) =>
    set((state) => ({
      boltParameters: {
        ...state.boltParameters,
        [key]: value
      }
    })),
  setNutParameter: (key, value) =>
    set((state) => ({
      nutParameters: {
        ...state.nutParameters,
        [key]: value
      }
    })),
  setWasherParameter: (key, value) =>
    set((state) => ({
      washerParameters: {
        ...state.washerParameters,
        [key]: value
      }
    })),
  setBracketParameter: (key, value) =>
    set((state) => ({
      bracketParameters: {
        ...state.bracketParameters,
        [key]: value
      }
    })),
  resetCurrentPart: () =>
    set((state) => {
      switch (state.partType) {
        case "gear":
          return { gearParameters: DEFAULT_GEAR_PARAMETERS };
        case "shaft":
          return { shaftParameters: DEFAULT_SHAFT_PARAMETERS };
        case "pulley":
          return { pulleyParameters: DEFAULT_PULLEY_PARAMETERS };
        case "bolt":
          return { boltParameters: DEFAULT_BOLT_PARAMETERS };
        case "nut":
          return { nutParameters: DEFAULT_NUT_PARAMETERS };
        case "washer":
          return { washerParameters: DEFAULT_WASHER_PARAMETERS };
        case "bracket":
          return { bracketParameters: DEFAULT_BRACKET_PARAMETERS };
        default:
          return state;
      }
    })
}));
