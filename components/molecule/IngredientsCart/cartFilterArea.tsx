'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CartFilterProps {
  onApplyFilter: (filterParams: any) => void;
  hasIngredients: boolean;
  ingredients: any[]; // Add ingredients prop to access cart items
  clearAll: () => void;
}

export const CartFilter = ({
  onApplyFilter,
  hasIngredients,
  ingredients,
  clearAll,
}: CartFilterProps) => {
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [mealPreference, setMealPreference] = useState<string>('');
  const [cookingTime, setCookingTime] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [recipesName, setRecipesName] = useState<string>('');
  const [otherConditions, setOtherConditions] = useState<string>('');

  // State for alert dialog
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  // State for allergy dropdown
  const [isAllergiesOpen, setIsAllergiesOpen] = useState<boolean>(false);
  // API state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Ref for the dropdown menu
  const allergyMenuRef = useRef<HTMLDivElement>(null);

  // Available allergy options
  const allergyOptions = [
    { value: '卵', label: '卵' },
    { value: '乳', label: '乳' },
    { value: 'えび', label: 'えび' },
    { value: 'かに', label: 'かに' },
    { value: '落花生', label: '落花生' },
  ];

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        allergyMenuRef.current &&
        !allergyMenuRef.current.contains(event.target as Node)
      ) {
        setIsAllergiesOpen(false);
        // Apply the temp allergies when closing
        setAllergies(tempAllergies);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tempAllergies]);

  // Initialize tempAllergies when allergies change or dropdown opens
  useEffect(() => {
    setTempAllergies(allergies);
  }, [allergies, isAllergiesOpen]);

  const handleApplyFilter = async () => {
    // Check if there are no ingredients
    if (!hasIngredients) {
      setAlertMessage('食材リストが空です。食材を追加してください。');
      setIsAlertOpen(true);
      return;
    }

    // Check if recipe name is empty
    if (!recipesName.trim()) {
      setAlertMessage('提案の名前を入力してください。');
      setIsAlertOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      // Prepare the request payload according to RecipeSuggestionRequest
      const requestData = {
        peopleCount,
        mealPreference: mealPreference || undefined,
        cookingTime: cookingTime || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
        recipesName,
        otherConditions: otherConditions || undefined,
        ingredients: ingredients.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
      };

      // Make API request
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'レシピの提案に失敗しました');
      }

      // Show success message
      setAlertMessage(
        'レシピの提案が完了しました。生成中のレシピはマイレシピから確認できます。'
      );
      setIsAlertOpen(true);

      // Call the original filter function for any additional client-side filtering
      onApplyFilter({
        peopleCount,
        mealPreference,
        cookingTime,
        allergies,
        recipesName,
        otherConditions,
      });
    } catch (error) {
      console.error('Recipe suggestion error:', error);
      setApiError((error as Error).message);
      setAlertMessage(`エラーが発生しました: ${(error as Error).message}`);
      setIsAlertOpen(true);
    } finally {
      clearAll();
      setIsLoading(false);
    }
  };

  const handlePeopleCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setPeopleCount(count);
    }
  };

  const handleAllergyToggle = (value: string) => {
    setTempAllergies((prev) => {
      // If already selected, remove it
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      // Otherwise add it
      return [...prev, value];
    });
  };

  const handleAllergyConfirm = () => {
    // Apply the temporary selections
    setAllergies(tempAllergies);
    // Close the dropdown
    setIsAllergiesOpen(false);
  };

  const toggleAllergiesDropdown = () => {
    // If opening dropdown, initialize temp values
    if (!isAllergiesOpen) {
      setTempAllergies([...allergies]);
    }
    setIsAllergiesOpen(!isAllergiesOpen);
  };

  return (
    <div className='p-4'>
      {/* Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {apiError ? '警告' : 'お知らせ'}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>
              了解
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top row with 4 filters */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
        <div className='p-2 bg-gray-20 rounded'>
          <div className='text-sm font-medium mb-2'>人数</div>
          <Input
            type='number'
            min='1'
            value={peopleCount}
            onChange={(e) => handlePeopleCountChange(e.target.value)}
            className='w-full h-8 text-center'
          />
        </div>

        <div className='p-2 bg-gray-20 rounded'>
          <div className='text-sm font-medium mb-2'>食事の好み</div>
          <select
            className='border rounded px-2 py-1 text-sm w-full h-8'
            value={mealPreference}
            onChange={(e) => setMealPreference(e.target.value)}
          >
            <option value=''>指定なし</option>
            <option value='和食'>和食</option>
            <option value='洋食'>洋食</option>
            <option value='中華'>中華</option>
          </select>
        </div>

        <div className='p-2 bg-gray-20 rounded'>
          <div className='text-sm font-medium mb-2'>調理時間</div>
          <select
            className='border rounded px-2 py-1 text-sm w-full h-8'
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
          >
            <option value=''>時間制限なし</option>
            <option value='15分以内'>15分以内</option>
            <option value='30分以内'>30分以内</option>
            <option value='1時間以内'>1時間以内</option>
          </select>
        </div>

        <div className='p-2 bg-gray-20 rounded'>
          <div className='text-sm font-medium mb-2'>アレルギー</div>
          <div className='relative' ref={allergyMenuRef}>
            <button
              type='button'
              onClick={toggleAllergiesDropdown}
              className='border rounded px-2 py-1 text-sm w-full h-8 text-left flex justify-between items-center'
            >
              <span className='truncate'>
                {allergies.length > 0 ? allergies.join('、') : 'なし'}
              </span>
              <span>{isAllergiesOpen ? '▲' : '▼'}</span>
            </button>

            {isAllergiesOpen && (
              <div className='absolute left-0 right-0 mt-1 border bg-white rounded-md shadow-lg z-10 p-2 max-h-48 overflow-y-auto'>
                <div className='space-y-2'>
                  {allergyOptions.map((option) => (
                    <div
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`allergy-${option.value}`}
                        checked={tempAllergies.includes(option.value)}
                        onCheckedChange={() =>
                          handleAllergyToggle(option.value)
                        }
                      />
                      <label
                        htmlFor={`allergy-${option.value}`}
                        className='text-sm cursor-pointer'
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className='mt-2 flex justify-end'>
                  <Button
                    size='sm'
                    onClick={handleAllergyConfirm}
                    className='px-3 py-1 text-xs'
                  >
                    確定
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row with 2 filters */}
      <div className='flex flex-col sm:flex-row gap-4 items-center'>
        <div className='p-2 bg-gray-20 rounded flex-grow'>
          <div className='text-sm font-medium mb-2'>提案の名前</div>
          <Input
            type='text'
            placeholder='例: 昼ごはん、お弁当等'
            value={recipesName}
            onChange={(e) => setRecipesName(e.target.value)}
            className='text-sm w-full h-8'
          />
        </div>
        <div className='p-2 bg-gray-20 rounded flex-grow'>
          <div className='text-sm font-medium mb-2'>他の条件</div>
          <Input
            type='text'
            placeholder='例: ベジタリアン、グルテンフリー等'
            value={otherConditions}
            onChange={(e) => setOtherConditions(e.target.value)}
            className='text-sm w-full h-8'
          />
        </div>

        <Button
          onClick={handleApplyFilter}
          disabled={isLoading || !hasIngredients}
          className={`${
            hasIngredients && !isLoading ? 'bg-blue-600' : 'bg-blue-200'
          } hover:bg-blue-600 text-white px-6 py-2 rounded-md self-end`}
        >
          {isLoading ? '処理中...' : '提案'}
        </Button>
      </div>
    </div>
  );
};
