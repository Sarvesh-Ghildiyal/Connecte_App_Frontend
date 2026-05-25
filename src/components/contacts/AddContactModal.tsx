import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactService } from '@/services/contacts';
import { Loader2, Plus } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({ isOpen, onClose, onSuccess }: AddContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '+91 ',
    tags: 'regular',
    opted_in: true,
  });

  const formatToE164 = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    return `+${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const e164Phone = formatToE164(formData.phone_number);
      if (!e164Phone) throw new Error('Phone number is required');

      await contactService.createOrUpdate({
        name: formData.name || null,
        phone_number: e164Phone,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        opted_in: formData.opted_in,
      });

      onSuccess();
      onClose();
      setFormData({
        name: '',
        phone_number: '+91 ',
        tags: 'regular',
        opted_in: true,
      });
    } catch (err: any) {
      let errMsg = 'Failed to add contact.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errMsg = detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'error'}: ${d.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errMsg = detail;
        } else if (typeof detail === 'object' && detail !== null) {
          errMsg = detail.msg || JSON.stringify(detail);
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md border border-red-100 italic">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Name (Optional)</label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Phone Number*</label>
              <Input
                placeholder="+91 "
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Tags (comma separated)</label>
              <Input
                placeholder="regular, vip"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#1B1B1B] hover:bg-black">
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
