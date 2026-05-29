from rest_framework.permissions import BasePermission


class IsVendor(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and (request.user.is_superuser or request.user.role == 'vendor')
        )
	
	
class IsOwnerVendor(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        return (
            request.user.is_superuser or obj.vendor.user == request.user
        )
	
	
	
	
	
	
	
	
	
	
	