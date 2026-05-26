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
  const [selectionMode, setSelectionMode] = useState<'tags' | 'contacts'>('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [excludedContactIds, setExcludedContactIds] = useState<string[]>([]);
  const [parameters, setParameters] = useState<TemplateParameterInput[]>([]);
  const [headerImageId, setHeaderImageId] = useState<string>('');

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
      // Prepare parameters according to the backend requirements:
      // 1. Separate named and positional
      // 2. Positional must be ordered by index
      // 3. Named must include the 'name' field
      const positional = parameters
        .filter(p => p.index !== undefined)
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(({ type, value, mode }) => ({ type, value, mode }));

      const named = parameters
        .filter(p => p.name !== undefined)
        .map(({ type, value, name, mode }) => ({ type, value, name, mode }));

      const finalParameters = [...positional, ...named];

      const payload: any = {
        template_id: selectedTemplate.id,
        parameters: finalParameters,
        header_image_id: headerImageId || undefined,
      };

      if (selectionMode === 'contacts') {
        payload.contact_ids = selectedContactIds;
      } else {
        const matched = contacts.filter(c => !c.is_deleted && c.tags.some(t => selectedTags.includes(t)) && !excludedContactIds.includes(c.id));
        if (excludedContactIds.length > 0) {
          // If we manually unchecked some contacts, convert selection to cherry-picked contact_ids
          payload.contact_ids = matched.map(c => c.id);
        } else {
          payload.tags = selectedTags;
        }
      }

      const result = await broadcastService.send(payload);
      logger.info('BROADCAST_WIZARD', 'Broadcast launched successfully', { result });

      if (result.status === 'filtered') {
        alert('No opted-in contacts matched the selected criteria. Broadcast was not sent.');
      } else {
        alert(`⚡ BROADCAST QUEUED — ${result.count} recipients will receive this message.`);
      }
    } catch (err: any) {
      logger.error('BROADCAST_WIZARD', 'Failed to launch broadcast', { error: err.message });
      alert('Failed to launch broadcast. Please check logs.');
    }
  };

  const recipientCount = selectionMode === 'contacts' 
    ? selectedContactIds.length 
    : contacts.filter(c => !c.is_deleted && c.tags.some(t => selectedTags.includes(t)) && !excludedContactIds.includes(c.id)).length;

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
            selectionMode={selectionMode}
            onSelectionModeChange={setSelectionMode}
            selectedTags={selectedTags}
            onSelectTags={(tags) => {
              setSelectedTags(tags);
              setExcludedContactIds([]); // Reset manual exclusions when tags change
            }}
            selectedContactIds={selectedContactIds}
            onSelectContactIds={setSelectedContactIds}
            excludedContactIds={excludedContactIds}
            onExcludeContactIds={setExcludedContactIds}
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
            headerImageId={headerImageId}
            onUpdateHeaderImageId={setHeaderImageId}
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
