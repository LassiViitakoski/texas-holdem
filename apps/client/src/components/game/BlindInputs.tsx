import { NumberInput } from '@/components/ui/NumberInput';

type BlindInputsProps = {
  blinds: number[];
  onChange: (blinds: number[]) => void;
};

export const BlindInputs = ({ blinds, onChange }: BlindInputsProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Blinds</label>
    <div className="flex gap-2">
      <NumberInput
        min={1}
        value={blinds[0]}
        onChange={(e) => {
          const newBlinds = [...blinds];
          newBlinds[0] = Number(e.target.value);
          onChange(newBlinds);
        }}
        placeholder="Small blind"
      />
      <NumberInput
        min={1}
        value={blinds[1]}
        onChange={(e) => {
          const newBlinds = [...blinds];
          newBlinds[1] = Number(e.target.value);
          onChange(newBlinds);
        }}
        placeholder="Big blind"
      />
    </div>
  </div>
);
