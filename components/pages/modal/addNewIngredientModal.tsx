'use client';
import { useState } from 'react';
import { ModalContainer } from '@/components/atom/modalContainer';
import { AddNewIngredientForm } from '@/components/molecule/addNewIngredientModal/addNewIngredientForm';
import { addIngredient } from '@/lib/api/ingredients';
import { Unit, IngredientCategory } from '@/types/ingredients';

interface AddNewIngredientModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddNewIngredientModal = ({
  onClose,
  onSuccess,
}: AddNewIngredientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const newIngredient = {
        name: formData.name,
        category: formData.category as IngredientCategory,
        quantity: formData.quantity,
        unit: formData.unit as Unit,
        expirationDate: new Date(formData.expirationDate),
        notes: formData.notes || undefined,
        status: 'active' as 'active',
        updatedAt: new Date(),
      };

      await addIngredient(newIngredient);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      setError('食材の追加に失敗しました');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <h2 className='text-2xl font-bold mb-4'>新しい食材を追加</h2>
      <div className='border-t mx-3 my-2'></div>
      <AddNewIngredientForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </ModalContainer>
  );
};
