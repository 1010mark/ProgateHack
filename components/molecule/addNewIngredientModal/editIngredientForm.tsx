import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextInputBox } from './textInputBox';
import { DateInputBox } from './DateInputBox';
import { SelectInput } from './selectInput';
import { Input } from '@/components/ui/input';
import { Unit, IngredientCategory, Ingredient } from '@/types/ingredients';

interface EditIngredientFormProps {
  onSubmit: (formData: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  ingredient: Ingredient;
}

const dummyUnitOptions: Unit[] = ['個', 'g', 'ml', '束', '本', '枚', 'パック'];
const dummyCategoryOptions: IngredientCategory[] = ['野菜', '肉', '魚'];

export const EditIngredientForm = ({
  onSubmit,
  loading,
  error,
  ingredient,
}: EditIngredientFormProps) => {
  const defaultDate = new Date();
  const [formData, setFormData] = useState<Ingredient>(ingredient);

  const handleChange = (field: string, value: string | number | Date) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit || formData.quantity <= 0) {
      return;
    }
    await onSubmit(formData);
  };

  return (
    <>
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='w-full items-center h-20'>
        <Input type='file' />
      </div>

      <div className='w-full h-fill grid grid-cols-2 justify-between px-2 gap-6'>
        <TextInputBox
          label='食材名'
          placeholder='例: トマト'
          type='text'
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <SelectInput
          selectTriggerName='カテゴリを選択'
          selectLabelName='カテゴリ'
          selectItems={dummyCategoryOptions}
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
        />
        <TextInputBox
          label='数量'
          placeholder='例: 1'
          type='number'
          value={formData.quantity.toString()}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseInt(e.target.value);
            handleChange('quantity', val);
          }}
        />
        <SelectInput
          selectTriggerName='単位を選択'
          selectLabelName='単位'
          selectItems={dummyUnitOptions}
          value={formData.unit}
          onChange={(value) => handleChange('unit', value)}
        />
        <DateInputBox
          label='賞味期限'
          placeholder='例: 2022-12-31'
          type='date'
          value={formData.expirationDate}
          onChange={(e) => handleChange('expirationDate', e.target.value)}
        />
        <TextInputBox
          label='説明(任意)'
          placeholder='例: ちょっと枯れてる'
          type='text'
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
      <div className='flex justify-end mt-4'>
        <Button
          className='mt-10 mr-1 py-2 w-40 font-bold text-xl hover:cursor-pointer bg-blue-400 hover:bg-blue-200 text-white'
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '処理中...' : '編集'}
        </Button>
      </div>
    </>
  );
};
