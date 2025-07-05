'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { countries } from '@/utils/countries';
import { displayToast } from '@/utils/sonnerToast';
import { useAuth } from '@/hooks/useAuth';

const WelcomeModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken, updateUser } = useAuth();

  useEffect(() => {
    if (localStorage.getItem('welcome') === 'true') return;
    onOpen();
    localStorage.setItem('welcome', 'true');
  }, [onOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);

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
        displayToast.error('Failed to save settings, please try again');
        return;
      }

      const updated = await response.json();
      displayToast.success('Settings updated successfully');
      updateUser(updated.user);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 800);
    } catch (error) {
      displayToast.error('Failed to save settings, please try again');
    }
  };

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-gray-900">
              Welcome !
            </ModalHeader>
            <ModalBody className="py-2">
              <p className="text-gray-700 mb-4 text-left">
                To help our AI personalize your experience, please fill in your information below.
                <br />
                You can update it anytime in your settings.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="City"
                  placeholder="Enter your city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="Postal Code"
                  placeholder="Enter your postal code"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
                <Select
                  label="Country"
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
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="flat" onPress={onClose}>
                    Skip
                  </Button>
                  <Button type="submit" color="primary" isLoading={isSubmitting}>
                    Save & Continue
                  </Button>
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;
