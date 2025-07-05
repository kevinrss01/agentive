'use client';

import { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/landing-page/button';
import { displayToast } from '@/utils/sonnerToast';
import { Input, Select, SelectItem } from '@heroui/react';
import { countries } from '@/utils/countries';

export default function SettingsPage() {
  const { user, updateUser, accessToken } = useAuth();

  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setCity(user.city ?? '');
    setPostalCode(user.postal_code ?? '');
    setCountry(user.country ?? '');
    setIsLoading(false);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/user/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ city, postalCode, country }),
        }
      );

      if (!response.ok) {
        console.error('Failed to save settings');
        return;
      }

      const updated = await response.json();
      displayToast.success('Settings updated successfully');
      updateUser(updated.user);
    } catch (error) {
      displayToast.error('Failed to update settings, please try again');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="w-full max-w-lg bg-white/80 rounded-2xl p-8 md:p-12 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Settings
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Update your profile information below.
          <br /> This will improve your experience with our AI.
        </p>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <Input
            label="City"
            placeholder="Enter your city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className=""
          />

          <Input
            label="Postal Code"
            placeholder="Enter your postal code"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className=""
          />

          {!isLoading && (
            <div className="flex flex-1">
              <Select
                label="Select a country"
                value={country}
                onChange={(e) =>
                  setCountry(countries.find((c) => c.key === e.target.value)?.label || '')
                }
                defaultSelectedKeys={
                  country ? [countries.find((cty) => cty.label === country)?.key as string] : []
                }
                className="w-full"
              >
                {countries.map((country) => (
                  <SelectItem key={country.key}>{country.label}</SelectItem>
                ))}
              </Select>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white font-semibold py-3 rounded-lg shadow-md hover:from-gray-800 hover:to-black transition-all duration-200"
          >
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
}
