import { useState, useEffect } from 'react';
import BroadcastStepBar from '@/components/broadcast/BroadcastStepBar';
import { Step1TemplateSelection } from './broadcast/Step1TemplateSelection';
import { Step2AudienceSelection } from './broadcast/Step2AudienceSelection';
import { Step3Configuration } from './broadcast/Step3Configuration';
import { Step4Review } from './broadcast/Step4Review';
import { useTemplateStore } from '@/store/templateStore';
import { broadcastService } from '@/services/broadcast';
import { contactService } from '@/services/contacts';
import type { Template, TemplateParameterInput, Contact } from '@/types';
import { logger } from '@/utils/logger';

export type BroadcastStep = 1 | 2 | 3 | 4;

export default function Broadcast() {
  const [currentStep, setCurrentStep] = useState<BroadcastStep>(1);
  const { templates, fetchTemplates, hasInitiallyFetched } = useTemplateStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  
  // Selection State
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [parameters, setParameters] = useState<TemplateParameterInput[]>([]);

  useEffect(() => {
    if (!hasInitiallyFetched) {
      fetchTemplates();
    }
  }, [hasInitiallyFetched, fetchTemplates]);

  useEffect(() => {
    const loadContacts = async () => {
      setIsContactsLoading(true);
      try {
        const data = await contactService.getAll();
        setContacts(data.contacts);
      } catch (err) {
        logger.error('BROADCAST_WIZARD', 'Failed to fetch contacts');
      } finally {
        setIsContactsLoading(false);
      }
    };
    loadContacts();
  }, []);

  // Navigation functions
  const nextStep = () => setCurrentStep((prev) => (prev < 4 ? (prev + 1) as BroadcastStep : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as BroadcastStep : prev));

  const handleLaunch = async () => {
    if (!selectedTemplate) return;

    try {
      const payload = {
        template_id: selectedTemplate.id,
        parameters,
        tags: selectedTags
      };

      await broadcastService.send(payload);
      logger.info('BROADCAST_WIZARD', 'Broadcast launched successfully', { payload });
      alert('BROADCAST LAUNCHED! ⚡');
    } catch (err: any) {
      logger.error('BROADCAST_WIZARD', 'Failed to launch broadcast', { error: err.message });
      alert('Failed to launch broadcast. Please check logs.');
    }
  };

  const recipientCount = contacts.filter(c => c.tags.some(t => selectedTags.includes(t))).length;

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] overflow-hidden">
      <BroadcastStepBar 
        currentStep={currentStep} 
        onLaunch={handleLaunch} 
      />

      <div className="flex-1 overflow-y-auto px-8 py-10 relative">
        {currentStep === 1 && (
          <Step1TemplateSelection 
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
            onNext={nextStep}
          />
        )}
        
        {currentStep === 2 && (
          <Step2AudienceSelection 
            contacts={contacts}
            isLoading={isContactsLoading}
            selectedTags={selectedTags}
            onSelectTags={setSelectedTags}
            onNext={nextStep}
            onBack={prevStep}
            templateCategory={selectedTemplate?.category}
          />
        )}

        {currentStep === 3 && selectedTemplate && (
          <Step3Configuration 
            template={selectedTemplate}
            parameters={parameters}
            onUpdateParameters={setParameters}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && selectedTemplate && (
          <Step4Review 
            template={selectedTemplate}
            recipientCount={recipientCount}
            onBack={prevStep}
            onLaunch={handleLaunch}
          />
        )}
      </div>
    </div>
  );
}
