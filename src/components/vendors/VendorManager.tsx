import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Plus, 
  Users2, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Vendor, VendorStatus, ExpenseCategory } from '../../types';
import { formatINR, CATEGORY_LABELS } from '../../utils/budgetCalculations';

export const VendorManager: React.FC = () => {
  const { activeEvent, addVendor, updateVendor, deleteVendor, showToast } = useEvent();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('catering');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [status, setStatus] = useState<VendorStatus>('contacted');
  const [notes, setNotes] = useState('');
  const [bookingVerified, setBookingVerified] = useState(false);

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <p className="text-charcoal-600">Select an event to view vendor directory</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName('');
    setCategory('catering');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setQuotedAmount('');
    setStatus('not_contacted');
    setNotes('');
    setBookingVerified(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category as ExpenseCategory);
    setContactPerson(v.contactPerson);
    setPhone(v.phone);
    setEmail(v.email);
    setQuotedAmount(v.quotedAmount.toString());
    setStatus(v.status);
    setNotes(v.notes);
    setBookingVerified(v.bookingVerified);
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numericQuote = Number(quotedAmount) || 0;

    if (editingVendor) {
      await updateVendor(editingVendor.id, {
        name: name.trim(),
        category,
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        quotedAmount: numericQuote,
        status,
        notes: notes.trim(),
        bookingVerified: status === 'booked' ? bookingVerified : false,
      });
    } else {
      await addVendor({
        name: name.trim(),
        category,
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        quotedAmount: numericQuote,
        status,
        notes: notes.trim(),
        bookingVerified: status === 'booked' ? bookingVerified : false,
      });
    }

    setIsAddModalOpen(false);
  };

  // Quick inline status change
  const handleQuickStatusChange = async (vendorId: string, newStatus: VendorStatus) => {
    await updateVendor(vendorId, { 
      status: newStatus,
      bookingVerified: newStatus === 'booked' 
    });
    showToast('success', 'Status Updated', `Vendor status changed to ${newStatus.replace('_', ' ')}.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Vendor Operations Directory</h1>
            <Badge variant="violet" size="sm" className="font-semibold">{activeEvent.vendors.length} Contractors</Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Maintain verified contractor quotes, contact coordinators directly, and lock in backup suppliers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Mandatory Verification Integrity Notice */}
      <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200 text-xs text-charcoal-700 flex items-start gap-3 shadow-subtle">
        <ShieldCheck className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-violet-950">Verification Integrity Standard</span>
          <p className="text-charcoal-600 leading-relaxed">
            All quotations and booking states here are user-recorded. PlanB AI never assumes vendor availability or falsely claims a third-party supplier is booked without direct offline confirmation.
          </p>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeEvent.vendors.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-charcoal-200">
            <Users2 className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-charcoal-800">No contractors recorded yet</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
              Add catering, tent house, sound engineers, or photographers to keep your quotes and contacts organized.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card"
            >
              <Plus className="w-4 h-4" /> Add First Vendor
            </button>
          </div>
        ) : (
          activeEvent.vendors.map((vendor) => (
            <Card key={vendor.id} className="p-6 flex flex-col justify-between space-y-4 hover:border-violet-300 transition-all">
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-violet-800 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                    {CATEGORY_LABELS[vendor.category as ExpenseCategory] || vendor.category}
                  </span>

                  {/* 1-Click Interactive Status Changer */}
                  <select
                    value={vendor.status}
                    onChange={(e) => handleQuickStatusChange(vendor.id, e.target.value as VendorStatus)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition-colors ${
                      vendor.status === 'booked'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : vendor.status === 'quotation_received'
                        ? 'bg-violet-50 text-violet-800 border-violet-200'
                        : vendor.status === 'contacted'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-charcoal-50 text-charcoal-600 border-charcoal-200'
                    }`}
                  >
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="quotation_received">Quote Received</option>
                    <option value="booked">Booked (Verified)</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-base font-bold text-charcoal-900">{vendor.name}</h3>
                  {vendor.contactPerson && (
                    <p className="text-xs text-charcoal-500 mt-0.5">Contact: <strong className="text-charcoal-700">{vendor.contactPerson}</strong></p>
                  )}
                </div>

                {/* Direct Action Contacts */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-charcoal-100">
                  {vendor.phone && (
                    <a 
                      href={`tel:${vendor.phone.replace(/\s+/g, '')}`} 
                      className="flex items-center gap-2 text-charcoal-600 hover:text-violet-800 font-medium group transition-colors"
                      title="Click to Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-violet-600" />
                      <span>{vendor.phone}</span>
                    </a>
                  )}
                  {vendor.email && (
                    <a 
                      href={`mailto:${vendor.email}`} 
                      className="flex items-center gap-2 text-charcoal-600 hover:text-violet-800 font-medium group transition-colors truncate"
                      title="Click to Email"
                    >
                      <Mail className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-violet-600" />
                      <span className="truncate">{vendor.email}</span>
                    </a>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-xs text-charcoal-600 bg-charcoal-50 p-2.5 rounded-xl border border-charcoal-100 line-clamp-2 leading-relaxed">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Bottom Quote & Action */}
              <div className="pt-3.5 border-t border-charcoal-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-charcoal-400 block font-medium">Quoted Price</span>
                  <span className="text-base font-black text-charcoal-900">
                    {formatINR(vendor.quotedAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    title="Edit Vendor"
                    className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    title="Delete Vendor"
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
        subtitle="Record contact information and quotation details."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-800">Vendor / Business Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Campus Corner Delights"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Booking Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                <option value="not_contacted">Not Contacted</option>
                <option value="contacted">Contacted / In Discussion</option>
                <option value="quotation_received">Quotation Received</option>
                <option value="booked">Booked (Deposit Paid)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. Ramesh Gupta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Quotation (₹ INR)</label>
              <input
                type="number"
                min="0"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                placeholder="11000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm font-semibold focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 44521"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-800">Contract Notes & Advance Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Quotation includes 100 snack boxes at ₹95/box, ₹2,000 advance given..."
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          {status === 'booked' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-900">
                <input
                  type="checkbox"
                  checked={bookingVerified}
                  onChange={(e) => setBookingVerified(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <span>I have manually verified and confirmed this booking with the vendor.</span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card"
            >
              {editingVendor ? 'Save Changes' : 'Record Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
