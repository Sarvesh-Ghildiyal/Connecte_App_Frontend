import { useState } from 'react';
import BroadcastStepBar from '@/components/broadcast/BroadcastStepBar';
import { Step1TemplateSelection } from './broadcast/Step1TemplateSelection';
import { Step2AudienceSelection } from './broadcast/Step2AudienceSelection';
import { Step3Configuration } from './broadcast/Step3Configuration';
import { Step4Review } from './broadcast/Step4Review';

// ── Types ───────────────────────────────────────────────────────────────────
export interface Template {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  description: string;
  bodyText: string;
  variablesCount: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  status: 'ACTIVE' | 'OFFLINE';
}

export type BroadcastStep = 1 | 2 | 3 | 4;

// ── Dummy Data ─────────────────────────────────────────────────────────────
const DUMMY_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'SUMMER_SALE_2024',
    category: 'MARKETING',
    description: 'High-conversion seasonal template designed for promotional campaigns with dynamic media support.',
    bodyText: 'Hi {{1}}, Get ready for our biggest sale! Use code {{2}} to get 20% off your next purchase. Valid until {{3}}.',
    variablesCount: 3,
  },
  {
    id: 't2',
    name: 'ORDER_CONFIRMATION',
    category: 'UTILITY',
    description: 'Essential transactional template for real-time order updates and shipping status notifications.',
    bodyText: 'Hello {{1}}, your order #{{2}} has been confirmed and will be shipped by {{3}}.',
    variablesCount: 3,
  },
  {
    id: 't3',
    name: 'OTP_VERIFICATION',
    category: 'AUTHENTICATION',
    description: 'Secure 2FA authentication flow with high delivery priority and minimalist interface.',
    bodyText: 'Your Connecte verification code is {{1}}. Do not share this with anyone.',
    variablesCount: 1,
  },
];

const DUMMY_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Alexander Wright', phone: '+1 (555) 012-9843', tags: ['LOYAL', 'RETAIL'], status: 'ACTIVE' },
  { id: 'c2', name: 'Beatrix Thorne', phone: '+44 20 7946 0123', tags: ['VIP'], status: 'ACTIVE' },
  { id: 'c3', name: 'Cassian Mercer', phone: '+61 2 5550 1234', tags: ['WHOLESALE'], status: 'OFFLINE' },
  { id: 'c4', name: 'Dahlia Vane', phone: '+49 30 123456', tags: ['LEAD', 'Q4_PROMO'], status: 'ACTIVE' },
  { id: 'c5', name: 'Elias Sterling', phone: '+1 (555) 789-0122', tags: ['CHURN_RISK'], status: 'ACTIVE' },
  { id: '6', name: 'Sarah Chen', phone: '+44 20 7946 0128', tags: ['VIP', 'LOYAL'], status: 'ACTIVE' },
  { id: '7', name: 'Marcus Vaughn', phone: '+91 98765 43210', tags: ['VIP'], status: 'ACTIVE' },
];

export default function Broadcast() {
  const [currentStep, setCurrentStep] = useState<BroadcastStep>(1);
  
  // Selection State
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [variableMappings, setVariableMappings] = useState<Record<number, string>>({});

  // Navigation functions
  const nextStep = () => setCurrentStep((prev) => (prev < 4 ? (prev + 1) as BroadcastStep : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as BroadcastStep : prev));

  const handleLaunch = () => {
    alert('BROADCAST LAUNCHED! ⚡ Check terminal for results.');
    console.log('Final Payload:', {
      template: selectedTemplate?.name,
      recipients: Array.from(selectedContactIds),
      mappings: variableMappings
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] overflow-hidden">
      {/* Universal Step Bar Header */}
      <BroadcastStepBar 
        currentStep={currentStep} 
        onLaunch={handleLaunch} 
      />

      {/* Wizard Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10 relative">
        {currentStep === 1 && (
          <Step1TemplateSelection 
            templates={DUMMY_TEMPLATES}
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
            onNext={nextStep}
          />
        )}
        
        {currentStep === 2 && (
          <Step2AudienceSelection 
            contacts={DUMMY_CONTACTS}
            selectedContactIds={selectedContactIds}
            onSelectContacts={setSelectedContactIds}
            onNext={nextStep}
            onBack={prevStep}
            templateCategory={selectedTemplate?.category}
          />
        )}

        {currentStep === 3 && selectedTemplate && (
          <Step3Configuration 
            template={selectedTemplate}
            variableMappings={variableMappings}
            onUpdateMappings={setVariableMappings}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && selectedTemplate && (
          <Step4Review 
            template={selectedTemplate}
            recipientCount={selectedContactIds.size}
            variableMappings={variableMappings}
            onBack={prevStep}
            onLaunch={handleLaunch}
          />
        )}
      </div>
    </div>
  );
}
