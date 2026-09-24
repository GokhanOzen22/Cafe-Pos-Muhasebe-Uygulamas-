import React, { useState } from 'react';
import { AppUser, UserPermissions, UserRole } from '../types';
import {
  Users, UserPlus, ShieldCheck, Smartphone, ChefHat, Key, Lock, Unlock,
  Edit3, Trash2, Search, Check, X, Eye, EyeOff, ShieldAlert,
  Sliders, Shield, AlertCircle, BarChart3, CheckCircle2
} from 'lucide-react';

interface UserManagementProps {
  users: AppUser[];
  onUpdateUsers: (users: AppUser[]) => void;
}

const DEFAULT_POS_PERMISSIONS: UserPermissions = {
  canTakeOrder: true,
  canApplyDiscount: false,
  canCancelItem: false,
  canTransferTable: true,
  canClosePayment: false, // Garson / POS hesap kapatamasın, sadece hesap istesin
  canAddTable: false,
  canManageInvoices: false,
  canViewReports: true, // Garsonlar için gün kapatma ve rapor alma açık
  canCloseDay: true, // Garsonlar için gün kapatma ve rapor alma açık
  canManageStock: false,
  canManageMenu: false,
  canManageUsers: false,
};

const DEFAULT_KITCHEN_PERMISSIONS: UserPermissions = {
  canTakeOrder: false,
  canApplyDiscount: false,
  canCancelItem: false,
  canTransferTable: false,
  canClosePayment: false,
  canAddTable: false,
  canManageInvoices: false,
  canViewReports: false,
  canCloseDay: false,
  canManageStock: true,
  canManageMenu: false,
  canManageUsers: false,
};

const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  canTakeOrder: true,
  canApplyDiscount: true,
  canCancelItem: true,
  canTransferTable: true,
  canClosePayment: true,
  canAddTable: true,
  canManageInvoices: true,
  canViewReports: true,
  canCloseDay: true,
  canManageStock: true,
  canManageMenu: true,
  canManageUsers: true,
};

const PERMISSION_CONFIG: Array<{
  key: keyof UserPermissions;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    key: 'canTakeOrder',
    label: 'Sipariş & Masa İşlemleri',
    description: 'Masalara sipariş girme, masa açma ve hesap görme yetkisi',
    icon: '🛒',
  },
  {
    key: 'canClosePayment',
    label: 'Hesap Kapatma & Ödeme Alma',
    description: 'Adisyonu ödemeyle kapatma yetkisi (Kapalıysa garson sadece hesap ister)',
    icon: '💳',
  },
  {
    key: 'canCloseDay',
    label: 'Gün Kapatma Yetkisi',
    description: 'Günü kapatıp resmi Z-Raporunu mühürleme ve arşive kaydetme',
    icon: '🔒',
  },
  {
    key: 'canViewReports',
    label: 'Ciro & Rapor Görme',
    description: 'Günlük ciro, satış istatistikleri ve Z-raporlarını inceleme',
    icon: '📊',
  },
  {
    key: 'canManageInvoices',
    label: 'Fiş / Fatura & Gider Kaydı',
    description: 'İşletme fatura ödemesi (elektrik, su vb.) ve mal alım fişi girme yetkisi',
    icon: '🧾',
  },
  {
    key: 'canApplyDiscount',
    label: 'İskonto & İndirim Yetkisi',
    description: 'Adisyona % veya tutar bazlı indirim uygulayabilme',
    icon: '🏷️',
  },
  {
    key: 'canCancelItem',
    label: 'Ürün & Adisyon İptali',
    description: 'Girilen siparişleri veya sipariş kalemlerini iptal edebilme',
    icon: '❌',
  },
  {
    key: 'canTransferTable',
    label: 'Masa Transfer Yetkisi',
    description: 'Masalar arasında adisyon ve sipariş aktarımı yapabilme',
    icon: '🔄',
  },
  {
    key: 'canAddTable',
    label: 'Yeni Masa Ekleme Yetkisi',
    description: 'Bölgelere/Salonlara yeni masa ekleme yetkisi',
    icon: '🪑',
  },
  {
    key: 'canManageStock',
    label: 'Stok & Hammadde Takibi',
    description: 'Stok miktarlarını güncelleme ve kritik seviye uyarısı alma',
    icon: '📦',
  },
  {
    key: 'canManageMenu',
    label: 'Menü & Fiyat Güncelleme',
    description: 'Yeni ürün/kategori ekleme, fiyat değiştirme yetkisi',
    icon: '🍔',
  },
  {
    key: 'canManageUsers',
    label: 'Kullanıcı & Yetki Yönetimi',
    description: 'Yeni personel tanımlama, silme ve yetkilerini düzenleme',
    icon: '🔑',
  },
];

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('pos');
  const [formPinCode, setFormPinCode] = useState<string>('');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>({
    ...DEFAULT_POS_PERMISSIONS,
  });
  const [formError, setFormError] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Toggle visible PIN code display for a user
  const togglePinVisibility = (userId: string) => {
    setVisiblePins((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Open modal to add user
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormRole('pos');
    setFormPinCode('');
    setFormPermissions({ ...DEFAULT_POS_PERMISSIONS });
    setFormError('');
    setShowModal(true);
  };

  // Open modal to edit user
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormRole(user.role);
    setFormPinCode(user.pinCode);
    setFormPermissions({ ...user.permissions });
    setFormError('');
    setShowModal(true);
  };

  // Role change in modal automatically sets default preset permissions
  const handleRoleChange = (role: UserRole) => {
    setFormRole(role);
    if (role === 'admin') setFormPermissions({ ...DEFAULT_ADMIN_PERMISSIONS });
    else if (role === 'kitchen') setFormPermissions({ ...DEFAULT_KITCHEN_PERMISSIONS });
    else setFormPermissions({ ...DEFAULT_POS_PERMISSIONS });
  };

  // Apply permission preset
  const applyPreset = (presetType: UserRole) => {
    if (presetType === 'admin') setFormPermissions({ ...DEFAULT_ADMIN_PERMISSIONS });
    else if (presetType === 'kitchen') setFormPermissions({ ...DEFAULT_KITCHEN_PERMISSIONS });
    else setFormPermissions({ ...DEFAULT_POS_PERMISSIONS });
  };

  // Save User (Create / Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Lütfen ad soyad alanını doldurun.');
      return;
    }
    if (!formUsername.trim()) {
      setFormError('Lütfen kullanıcı adı girin.');
      return;
    }
    if (!formPinCode || formPinCode.length < 4) {
      setFormError('Giriş PIN kodu en az 4 haneli olmalıdır.');
      return;
    }

    // Check duplicate username
    const duplicate = users.find(
      (u) =>
        u.username.toLowerCase() === formUsername.trim().toLowerCase() &&
        u.id !== editingUser?.id
    );
    if (duplicate) {
      setFormError('Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.');
      return;
    }

    if (editingUser) {
      // Edit mode
      const updatedList = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            username: formUsername.trim(),
            role: formRole,
            pinCode: formPinCode.trim(),
            permissions: formPermissions,
          };
        }
        return u;
      });
      onUpdateUsers(updatedList);
    } else {
      // Create mode
      const newUser: AppUser = {
        id: 'user-' + Date.now(),
        name: formName.trim(),
        username: formUsername.trim(),
        role: formRole,
        pinCode: formPinCode.trim(),
        createdAt: new Date().toISOString(),
        permissions: formPermissions,
      };
      onUpdateUsers([...users, newUser]);
    }

    setShowModal(false);
  };

  // Quick toggle permission directly from list card
  const handleToggleSinglePermission = (
    userId: string,
    permissionKey: keyof UserPermissions
  ) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permissionKey]: !u.permissions[permissionKey],
          },
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
  };

  // Batch toggle Day Closure and Reports for all waiters
  const handleBatchGrantPosDayCloseAndReports = (enable: boolean) => {
    const updatedUsers = users.map((u) => {
      if (u.role === 'pos') {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            canCloseDay: enable,
            canViewReports: enable,
          },
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    setFeedbackMessage(
      enable
        ? '✓ Tüm garsonlara Gün Kapatma ve Z-Raporu alma yetkisi başarıyla verildi.'
        : '✓ Tüm garsonlardan Gün Kapatma ve Z-Raporu yetkisi kaldırıldı.'
    );
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Delete user handler
  const handleDeleteUser = (user: AppUser) => {
    if (user.isSystemAdmin) {
      alert('Sistem Yöneticisi hesabı güvenlik nedeniyle silinemez!');
      return;
    }
    if (
      window.confirm(
        `"${user.name}" (${user.username}) kullanıcısını silmek istediğinize emin misiniz?`
      )
    ) {
      const updatedUsers = users.filter((u) => u.id !== user.id);
      onUpdateUsers(updatedUsers);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.pinCode.includes(query);
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const posCount = users.filter((u) => u.role === 'pos').length;
  const kitchenCount = users.filter((u) => u.role === 'kitchen').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Kullanıcı ve Yetki Yönetim Paneli
                <span className="text-xs font-normal bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                  {users.length} Kayıtlı Kullanıcı
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Personel hesaplarını tanımlayın, giriş PIN kodlarını belirleyin ve modül bazlı yetkilerini anlık kontrol edin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open_change_password_modal'));
              }}
              className="flex items-center justify-center gap-2 bg-amber-500/15 hover:bg-amber-500 text-amber-500 hover:text-stone-950 border border-amber-500/30 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
              title="Kendi PIN Kodunuzu / Giriş Şifrenizi Değiştirin"
            >
              <Key className="w-4 h-4" />
              <span>Kendi Şifremi Değiştir</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yeni Kullanıcı Ekle</span>
            </button>
          </div>
        </div>

        {/* Quick Role Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              {users.length}
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">TOPLAM</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Personel</span>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">YÖNETİCİ</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{adminCount} Admin</span>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">GARSON (POS)</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{posCount} Garson</span>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">MUTFAK</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{kitchenCount} Personel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Feedback Notification */}
      {feedbackMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Permissions Batch Action Banner for Day Closure & Reports */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                Garsonlar İçin Gün Kapatma & Z-Raporu Yetkilendirmesi
              </h4>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Hızlı İşlem
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Tüm garsonlara tek tıkla Gün Kapatma ve Z-Raporu alma yetkisi verebilir veya aşağıdaki kullanıcı kartlarından tek tek seçim yaparak açıp kapatabilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleBatchGrantPosDayCloseAndReports(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all cursor-pointer active:scale-95"
            title="Tüm garson personellerine gün kapatma ve rapor alma yetkisi tanımlar"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Tüm Garsonlara Yetki Ver</span>
          </button>
          <button
            type="button"
            onClick={() => handleBatchGrantPosDayCloseAndReports(false)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
            title="Garson personellerinden gün kapatma ve rapor yetkisini kaldırır"
          >
            <X className="w-3.5 h-3.5" />
            <span>Garsonlardan Yetkiyi Al</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="İsim, kullanıcı adı veya PIN ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Tümü ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              roleFilter === 'admin'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Yöneticiler ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('pos')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              roleFilter === 'pos'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Garsonlar ({posCount})
          </button>
          <button
            onClick={() => setRoleFilter('kitchen')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              roleFilter === 'kitchen'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Mutfak ({kitchenCount})
          </button>
        </div>
      </div>

      {/* Users Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">Aranan kriterlere uygun kullanıcı bulunamadı.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isPinShown = visiblePins[user.id];

            return (
              <div
                key={user.id}
                className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                {/* User Card Top Info */}
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      {/* Role Avatar */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${
                          user.role === 'admin'
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : user.role === 'kitchen'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                        }`}
                      >
                        {user.role === 'admin' && <ShieldCheck className="w-6 h-6" />}
                        {user.role === 'kitchen' && <ChefHat className="w-6 h-6" />}
                        {user.role === 'pos' && <Smartphone className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                            {user.name}
                          </h3>
                          {user.isSystemAdmin && (
                            <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md uppercase">
                              Ana Yöneticı
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 font-mono">@{user.username}</p>
                      </div>
                    </div>

                    {/* Role Badge & Actions */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50'
                            : user.role === 'kitchen'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
                        }`}
                      >
                        {user.role === 'admin' && 'Yönetici'}
                        {user.role === 'kitchen' && 'Mutfak Şefi'}
                        {user.role === 'pos' && 'Garson (POS)'}
                      </span>

                      <button
                        onClick={() => handleOpenEditModal(user)}
                        title="Kullanıcıyı Düzenle"
                        className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.isSystemAdmin}
                        title={
                          user.isSystemAdmin
                            ? 'Sistem yöneticisi silinemez'
                            : 'Kullanıcıyı Sil'
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isSystemAdmin
                            ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
                            : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PIN Code Box */}
                  <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 text-xs mt-3">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Giriş PIN Kodu:</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-amber-400 tracking-wider">
                        {isPinShown ? user.pinCode : '••••'}
                      </span>
                    </div>

                    <button
                      onClick={() => togglePinVisibility(user.id)}
                      className="text-stone-400 hover:text-stone-200 text-[11px] flex items-center gap-1 font-medium"
                    >
                      {isPinShown ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Gizle
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Göster
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlighted Day Close & Report Permission Toggle Bar */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 space-y-2 mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Günü Kapatma & Z-Raporu Yetkisi
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        Hızlı Seçim
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleSinglePermission(user.id, 'canCloseDay')}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer font-bold text-xs ${
                          user.permissions?.canCloseDay
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-200'
                        }`}
                        title="Tıklayarak Gün Kapatma yetkisini anlık açıp kapatabilirsiniz"
                      >
                        <span className="flex items-center gap-1 truncate">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>Gün Kapatma</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${user.permissions?.canCloseDay ? 'bg-stone-950 text-amber-400' : 'bg-stone-700 text-stone-300'}`}>
                          {user.permissions?.canCloseDay ? 'AÇIK' : 'KAPALI'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSinglePermission(user.id, 'canViewReports')}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer font-bold text-xs ${
                          user.permissions?.canViewReports
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-200'
                        }`}
                        title="Tıklayarak Rapor Görme yetkisini anlık açıp kapatabilirsiniz"
                      >
                        <span className="flex items-center gap-1 truncate">
                          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                          <span>Rapor Görme</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${user.permissions?.canViewReports ? 'bg-stone-950 text-amber-400' : 'bg-stone-700 text-stone-300'}`}>
                          {user.permissions?.canViewReports ? 'AÇIK' : 'KAPALI'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Permissions Grid */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      Kullanıcı Modül Yetkileri
                    </span>
                    <span className="text-[10px] font-normal text-stone-400">
                      (Anlık değiştirmek için tıklayın)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {PERMISSION_CONFIG.map((perm) => {
                      const isAllowed = user.permissions[perm.key];

                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() =>
                            handleToggleSinglePermission(user.id, perm.key)
                          }
                          className={`p-2 rounded-xl text-left border transition-all flex items-start gap-2 ${
                            isAllowed
                              ? 'bg-amber-500/10 border-amber-500/30 text-stone-900 dark:text-stone-100'
                              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <span className="text-sm mt-0.5">{perm.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[11px] truncate">
                                {perm.label}
                              </span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                  isAllowed
                                    ? 'bg-emerald-500 text-stone-950'
                                    : 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                                }`}
                              >
                                {isAllowed ? '✓' : '✕'}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 line-clamp-1">
                              {perm.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                    {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Personel bilgilerini ve giriş yetkilerini yapılandırın.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-medium mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Selin Yılmaz"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-medium mb-1">
                    Kullanıcı Adı (Giriş Adı) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: selin"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-medium mb-1">
                    Sistem Rolü *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="pos">Garson (POS Ekranı)</option>
                    <option value="kitchen">Mutfak Şefi (Mutfak Ekranı)</option>
                    <option value="admin">Sistem Yöneticisi (Full Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-medium mb-1">
                    4 Haneli Giriş PIN Kodu *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Örn: 1234"
                    value={formPinCode}
                    onChange={(e) => setFormPinCode(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-amber-400 font-mono font-bold tracking-widest"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                    Hızlı Yetki Şablonları
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('pos')}
                    className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium text-[11px] transition-colors"
                  >
                    Garson Yetkileri
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('kitchen')}
                    className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium text-[11px] transition-colors"
                  >
                    Mutfak Yetkileri
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('admin')}
                    className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-medium text-[11px] transition-colors"
                  >
                    Yönetici (Tam Yetki)
                  </button>
                </div>
              </div>

              {/* Checkboxes List for Customizing Permissions */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Detaylı Modül İzinleri
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {PERMISSION_CONFIG.map((perm) => {
                    const isChecked = formPermissions[perm.key];

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-stone-100'
                            : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setFormPermissions({
                              ...formPermissions,
                              [perm.key]: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <span className="font-semibold text-[11px] block text-stone-900 dark:text-stone-200">
                            {perm.icon} {perm.label}
                          </span>
                          <span className="text-[10px] text-stone-400 block leading-tight">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 rounded-xl font-medium text-xs transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  {editingUser ? 'Güncellemeleri Kaydet' : 'Kullanıcıyı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
