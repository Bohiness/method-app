export interface VoiceToneType {
    name_id: NameId;
    name: string;
    description: string;
    gradient: [string, string];
    example: string;
    color: string;
}

export type NameId =
    | 'neutral_nitron'
    | 'friendly_nitron'
    | 'serious_nitron'
    | 'funny_nitron'
    | 'mysterious_nitron'
    | 'calm_luna'
    | 'depth_aidan'
    | 'analysis_vincent'
    | 'focus_ray'
    | 'risk_jack'
    | 'energy_rico'
    | 'sarcasm_greta'
    | 'chaos_lucius'
    | 'discipline_hector'
    | 'brutal_tyler'
    | 'sad_luna'
    | 'worry_luna'
    | 'worry_nitron';

export type DeeperType = 'nextStep' | 'support' | 'changeView' | 'adviceFromFuture' | 'challenge' | 'goDeeper';

export type settingsOfAiType = {
    toneOfVoice?: NameId;
    typeOfDeeper?: DeeperType;
};
