from django.db.models import base, Model
from django.utils.translation import get_language


class TranslatableMeta(base.ModelBase):
    """
    Metaclass that looks for a special field called __translatable__ which is a dictionary containing keys as the name
    of the translatable properties, and the values being lambda functions that generate the field.

    Example:
         __translatable__ = {
            'name': lambda l: models.CharField(
                _("Name in {LANGUAGE_NAME}".format(**l)),
                max_length=256,
                default='',
                blank=True,
            ),
        }

    The metaclass will read those fields, and generate suffixed fields that match what languages are available
    in the settings.

    Example: (Settings contain: ar, fa, fr, el, en)
    name ->     name_ar
                name_fa
                name_fr
                name_el
                name_en

    For each translatable property, this metaclass also creates a dynamic property named after the original field
    defined in the __translatable__ field (in the case above, the new property will be called "name").

    This special property will use the django i18n tools to detect the user's language, and if it is found in the
    object, it will return the translated language. If not, it returns the english version.

    This metaclass will also search for a property named either "name" or "title", and if it is available,
    it will make the special property above return when __str__ is called.
    """

    def __new__(cls, name, bases, attrs):
        super_new = super(TranslatableMeta, cls).__new__

        def name_in_default_language(self):
            """
            Function that is injected in the __str__ function if the model has a "Name" property
            :param self: object that inherits this metaclass
            :return: The value from the name property.
            """
            return self.name

        def title_in_default_language(self):
            """
            Function that is injected in the __str__ function if the model doesn't have a "Name" property,
            but it does have a "Title" property.
            :param self: object that inherits this metaclass
            :return: The value of the title property
            """
            return self.title

        def fallback_field(field):
            """
            Functions that generates a property that wraps the translated field. This function will generate a property
            without the _<ISO> suffix. The value of the output and the destination of the input will depend on what
            language the user has currently selected
            :param field: name of the field to be wrapped
            :return: property object that can be added to the metaclass
            """
            fallback_name = '%s_%s' % (field, 'en')

            def getter(self):
                """
                Getter function that detects the language used by the request and returns the value in that language.
                Falls back to english.
                :param self: object that inherits this metaclass
                :return: translated property in the language selected in the request
                """
                language = get_language()
                field_name = '%s_%s' % (field, language[:2])
                if hasattr(self, field_name) and getattr(self, field_name):
                    return getattr(self, field_name)
                return getattr(self, fallback_name)  # Always fall back to english

            def setter(self, value):
                """
                Setter function that detects the language of the request and sets the value of the appropriate property.
                Falls back to english
                :param self: object that inherits this metaclass
                :param value: value to be set in property
                :return: None
                """
                language = get_language()
                field_name = '%s_%s' % (field, language[:2])
                if hasattr(self, field_name):
                    setattr(self, field_name, value)
                else:
                    # falling back setter to english
                    setattr(self, fallback_name, value)

            return property(getter, setter)

        if '__translatable__' in attrs:
            __translatable__ = attrs['__translatable__']
            new_attributes = dict()

            # There are issues importing some settings from the the top of models.py
            from django.conf import settings

            # Enumerates the translatable items defined in the subclass
            for attribute_name, attribute_lambda in __translatable__.items():
                # Enumerates the languages in the settings
                for language_code, language_name in settings.LANGUAGES:
                    # The information below is passed down to the lambda functions
                    # the use of lambda functions is deliberate, to avoid the complexity of the copying objects
                    language_dictionary = {'LANGUAGE_CODE': language_code, 'LANGUAGE_NAME': language_name}
                    new_attributes.update({
                        "{}_{}".format(attribute_name, language_code): attribute_lambda(language_dictionary)
                    })

                # Adding a dynamic property that detects the current language to the mix
                new_attributes.update({attribute_name: fallback_field(attribute_name)})

            new_attributes.update(attrs)
            attrs = new_attributes

            # If the attributes contain either name or title, make one of those the property returned by __str__
            if 'name' in __translatable__:
                attrs['__str__'] = name_in_default_language
            elif 'title' in __translatable__:
                attrs['__str__'] = title_in_default_language

            # Remove the __translatable__ field to make the runtime object a little less crowded
            del attrs['__translatable__']

        new_ = super_new(cls, name, bases, attrs)

        return new_

"""
The class below is a frankenstein that fools the migration engine to ignore it.
"""
TranslatableModel = TranslatableMeta(
    "TranslatableModel",
    (Model,),
    {
        '__module__': TranslatableMeta.__module__,
        'Meta': type("Meta", (object,), {'abstract': True})
    }
)
